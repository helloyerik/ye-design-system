package ye.designsystem.compose.motion

import android.view.HapticFeedbackConstants
import android.view.View

/** Minimal haptics (API 30+ constants with fallbacks). Port the full yereader Haptics.kt when adopting. */
object YeHaptics {
    fun segment(view: View) { view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK) }
    fun longPress(view: View) { view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS) }
    fun toggle(view: View, on: Boolean) {
        val c = if (android.os.Build.VERSION.SDK_INT >= 30) {
            if (on) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.REJECT
        } else HapticFeedbackConstants.CONTEXT_CLICK
        view.performHapticFeedback(c)
    }
}
