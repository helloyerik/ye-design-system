package ye.designsystem.compose.motion

// Ported from helloyerik/yereader core/ui/.../motion/Motion.kt. Durations, easings and
// springs now come from the generated YeTokens (single source with the web kit).

import android.content.Context
import android.database.ContentObserver
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FiniteAnimationSpec
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.PointerInputChange
import androidx.compose.ui.input.pointer.util.VelocityTracker
import androidx.compose.ui.input.pointer.util.addPointerInputChange
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import ye.designsystem.tokens.YeTokens

val LocalReducedMotion = staticCompositionLocalOf { false }

object YeMotion {
    val easeOut = YeTokens.Ease.out
    val easeInOut = YeTokens.Ease.inOut
    val easeDrawer = YeTokens.Ease.drawer

    const val pressMs = YeTokens.Dur.pressMs
    const val iconMs = YeTokens.Dur.swapMs
    const val enterMs = YeTokens.Dur.modalMs
    const val exitMs = YeTokens.Dur.modalExitMs
    const val alphaMs = YeTokens.Dur.alphaMs
    const val staggerMs = YeTokens.Dur.staggerMs
    /** yereader-only values not (yet) in tokens. */
    const val tabMs = 140
    const val moveMs = 220
    const val coverScale = 0.92f
    const val pressScale = YeTokens.Gesture.pressScale
    const val enterScale = YeTokens.Gesture.enterScale

    /** yereader `release` (0.82/520) — not a kit token yet. */
    val release = spring<Float>(dampingRatio = 0.82f, stiffness = 520f)
    val sheetSettle = YeTokens.Spring.settle<Float>()
    val swipeReturn = YeTokens.Spring.swipe<Float>()
    val pageTurn = YeTokens.Spring.page<Float>()
    val pressDown = YeTokens.Spring.pressDown<Float>()
    /** NB: kit token is 0.65/500; yereader used 0.6/500. */
    val pressUp = YeTokens.Spring.pressUp<Float>()

    fun <T> enterSpec(reduced: Boolean): FiniteAnimationSpec<T> = tween(if (reduced) alphaMs else enterMs, easing = easeOut)
    fun <T> exitSpec(reduced: Boolean): FiniteAnimationSpec<T> = tween(if (reduced) alphaMs else exitMs, easing = easeOut)
    fun <T> moveSpec(reduced: Boolean): FiniteAnimationSpec<T> = if (reduced) snap() else tween(moveMs, easing = easeInOut)
    fun <T> pressSpec(): FiniteAnimationSpec<T> = tween(pressMs, easing = easeOut)
    fun <T> iconSpec(reduced: Boolean): FiniteAnimationSpec<T> = tween(if (reduced) alphaMs else iconMs, easing = easeOut)
    fun <T> drawerSpec(reduced: Boolean): FiniteAnimationSpec<T> = tween(if (reduced) alphaMs else enterMs, easing = easeDrawer)

    fun tabIn(reduced: Boolean): EnterTransition = fadeIn(tween(if (reduced) alphaMs else tabMs, easing = easeOut))
    fun tabOut(reduced: Boolean): ExitTransition = fadeOut(tween(if (reduced) alphaMs else 100, easing = easeOut))

    fun pushIn(reduced: Boolean): EnterTransition {
        val fade = fadeIn(enterSpec(reduced))
        if (reduced) return fade
        return fade + scaleIn(enterSpec(false), initialScale = enterScale, transformOrigin = TransformOrigin.Center)
    }
    fun pushOut(reduced: Boolean): ExitTransition = fadeOut(exitSpec(reduced))
    fun popIn(reduced: Boolean): EnterTransition {
        val fade = fadeIn(exitSpec(reduced))
        if (reduced) return fade
        return fade + slideInHorizontally(exitSpec(false)) { -it / 4 }
    }
    /** Predictive-back seekable pop: scale 0.9 + trailing nudge [shiftPx]. */
    fun popOut(reduced: Boolean, shiftPx: Int = 24): ExitTransition {
        val fade = fadeOut(tween(if (reduced) alphaMs else exitMs, easing = LinearEasing))
        if (reduced) return fade
        return fade + scaleOut(tween(exitMs, easing = LinearEasing), targetScale = 0.9f) +
            slideOutHorizontally(tween<IntOffset>(exitMs, easing = LinearEasing)) { shiftPx.coerceIn(0, 48) }
    }
    fun chromeIn(reduced: Boolean): EnterTransition {
        val fade = fadeIn(enterSpec(reduced))
        if (reduced) return fade
        return fade + slideInVertically(enterSpec(false)) { -it / 5 }
    }
    fun chromeOut(reduced: Boolean): ExitTransition {
        val fade = fadeOut(exitSpec(reduced))
        if (reduced) return fade
        return fade + slideOutVertically(exitSpec(false)) { -it / 5 }
    }

    /** Commit a drag when it travelled far enough or was flung fast enough in the same direction. */
    fun shouldCommit(travel: Float, velocity: Float, travelPx: Float, flingPx: Float): Boolean =
        (travel >= travelPx && velocity > -flingPx) || (velocity >= flingPx && travel > 0f)
}

@Composable
fun rememberReducedMotion(): Boolean {
    val context = LocalContext.current
    val reduced = remember { mutableStateOf(animatorRemoved(context)) }
    DisposableEffect(context) {
        val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
            override fun onChange(selfChange: Boolean) { reduced.value = animatorRemoved(context) }
        }
        val uri = Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE)
        context.contentResolver.registerContentObserver(uri, false, observer)
        reduced.value = animatorRemoved(context)
        onDispose { context.contentResolver.unregisterContentObserver(observer) }
    }
    return reduced.value
}

internal fun animatorRemoved(context: Context): Boolean = runCatching {
    Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)
}.getOrDefault(1f) == 0f

/** Press-scale + ripple + optional haptics. [longClickLabel] is app-localized. */
@OptIn(ExperimentalFoundationApi::class)
fun Modifier.yeClickable(
    onClick: () -> Unit,
    onLongClick: (() -> Unit)? = null,
    haptic: Boolean = false,
    toggleOn: Boolean? = null,
    longClickLabel: String? = null,
): Modifier = composed {
    val reduced = LocalReducedMotion.current
    val view = LocalView.current
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    var latched by remember { mutableStateOf(false) }
    LaunchedEffect(pressed) {
        if (pressed) latched = true else { delay(80); latched = false }
    }
    val scale by animateFloatAsState(
        targetValue = if (latched && !reduced) YeMotion.pressScale else 1f,
        animationSpec = if (pressed) YeMotion.pressDown else YeMotion.pressUp,
        label = "press",
    )
    val click = {
        if (haptic) { if (toggleOn == null) YeHaptics.segment(view) else YeHaptics.toggle(view, toggleOn) }
        onClick()
    }
    graphicsLayer { scaleX = scale; scaleY = scale }.then(
        if (onLongClick != null) {
            Modifier.combinedClickable(
                interactionSource = interaction, indication = ripple(), onLongClickLabel = longClickLabel,
                onClick = click, onLongClick = { YeHaptics.longPress(view); onLongClick() },
            )
        } else {
            Modifier.clickable(interactionSource = interaction, indication = ripple(), onClick = click)
        },
    )
}

/** Staggered fade/rise for the first 8 list items. */
fun Modifier.yeAppear(index: Int, onSettled: () -> Unit = {}): Modifier = composed {
    val reduced = LocalReducedMotion.current
    val skip = index < 0 || index > 8
    val progress = remember { Animatable(if (skip) 1f else 0f) }
    LaunchedEffect(skip) {
        when {
            skip -> progress.snapTo(1f)
            reduced -> progress.animateTo(1f, tween(YeMotion.alphaMs, easing = YeMotion.easeOut))
            else -> progress.animateTo(1f, tween(YeMotion.enterMs, delayMillis = index.coerceIn(0, 7) * YeMotion.staggerMs, easing = YeMotion.easeOut))
        }
        onSettled()
    }
    graphicsLayer {
        alpha = progress.value
        if (!reduced && !skip) translationY = (1f - progress.value) * 8.dp.toPx()
    }
}

class YeDrag(initial: Float = 0f) {
    var value by mutableFloatStateOf(initial)
        private set
    private var job: Job? = null
    fun stop() { job?.cancel(); job = null }
    fun jump(next: Float) { stop(); value = next }
    fun animate(scope: CoroutineScope, target: Float, spec: AnimationSpec<Float>, initialVelocity: Float = 0f, onEnd: () -> Unit = {}): Job {
        stop()
        val from = value
        return scope.launch {
            val anim = Animatable(from)
            anim.animateTo(target, spec, initialVelocity = initialVelocity) { this@YeDrag.value = anim.value }
            onEnd()
        }.also { job = it }
    }
}

class YeFling {
    private val tracker = VelocityTracker()
    fun clear() = tracker.resetTracking()
    fun add(change: PointerInputChange) = tracker.addPointerInputChange(change)
    fun xPerSec(): Float = runCatching { tracker.calculateVelocity().x }.getOrDefault(0f)
    fun yPerSec(): Float = runCatching { tracker.calculateVelocity().y }.getOrDefault(0f)
}
