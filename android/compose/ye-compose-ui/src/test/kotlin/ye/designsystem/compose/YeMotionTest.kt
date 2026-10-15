package ye.designsystem.compose

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import ye.designsystem.compose.motion.YeMotion
import ye.designsystem.tokens.YeTokens

class YeMotionTest {
    @Test fun durationsComeFromTokens() {
        assertEquals(YeTokens.Dur.modalMs, YeMotion.enterMs)
        assertEquals(240, YeMotion.enterMs)
        assertEquals(0.97f, YeMotion.pressScale)
    }
    @Test fun commitRules() {
        assertTrue(YeMotion.shouldCommit(100f, 0f, 72f, 1000f))
        assertTrue(YeMotion.shouldCommit(10f, 1500f, 72f, 1000f))
        assertFalse(YeMotion.shouldCommit(100f, -1500f, 72f, 1000f))
        assertFalse(YeMotion.shouldCommit(10f, 100f, 72f, 1000f))
    }
}
