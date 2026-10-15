# ye-compose-ui

Android library for Compose apps. It is seeded from yereader `core/ui` (`motion/Motion.kt`), and its tokens are the generated `build/<app>/YeTokens.kt`.

- `YeTokens`: colors, radius, size, space, type, ease, durations, springs, gestures. Generated; do not edit.
- `YeMotion`: easings, durations, springs, enter/exit/push/pop/chrome transitions, `shouldCommit`, `rememberReducedMotion`, `Modifier.yeClickable`, `Modifier.yeAppear`, `YeDrag`, `YeFling`.
- `YeHaptics`: minimal version.
- `YeTheme`: provides `LocalYeColors` and `LocalReducedMotion`.

Build: `npm run tokens`, then `cd android/compose && ./gradlew :ye-compose-ui:assembleDebug testDebugUnitTest [-PyeApp=yeplayer]`. JDK 17.

Differences from yereader:
- `pressUp` is 0.65/500, from the kit token. yereader used 0.6/500.
- `release` (0.82/520), `tabMs` and `moveMs` stay local for now.
- The long-press label is a parameter (i18n). yereader hard-coded "Ещё".

Not ported yet: YeSheet, Gestures (`yeSwipeUp`), YeIconMotion, YeInsets, full Haptics, Tabler icons.
