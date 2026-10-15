package ye.designsystem.compose

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import ye.designsystem.compose.motion.LocalReducedMotion
import ye.designsystem.compose.motion.rememberReducedMotion
import ye.designsystem.tokens.YeTokens

data class YeColors(val bg: Color, val fg: Color, val dim: Color, val line: Color, val surface: Color, val danger: Color)

val LocalYeColors = staticCompositionLocalOf { lightColors() }

fun lightColors() = with(YeTokens.Light) { YeColors(bg, fg, dim, line, surface, danger) }
fun darkColors() = with(YeTokens.Dark) { YeColors(bg, fg, dim, line, surface, danger) }

/** Root wrapper: provides token colors and the system reduced-motion flag. */
@Composable
fun YeTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalYeColors provides if (dark) darkColors() else lightColors(),
        LocalReducedMotion provides rememberReducedMotion(),
        content = content,
    )
}
