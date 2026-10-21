# Changelog
## Unreleased — 2026-10-21
- `YE_APPS`: added Yejournal (https://journal.yerik.xyz, icon: `IconFlower`) — daily memory journal with pixel flowers.
- `YE_APPS`: added YeConvert (https://convert.yerik.xyz, icon: `IconTransform`) — client-side image converter (PNG to WebP).
## Unreleased — 2026-10-20
- `YE_APPS`: Yetracker → https://tracker.yerik.xyz (shared Ye sign-in; https://hexpo.vercel.app still works).
- `YE_APPS`: Yecalendar → https://calendar.yerik.xyz (primary host; shared Ye sign-in lives on *.yerik.xyz).
- `AppRail` + `YE_APPS` + `YeMark` (`apps.tsx`, `.ye-rail*` in ui.css): desktop ye-apps switcher rail (Yandex 360 layout, monochrome). 40 px tiles via `--ye-ctl-h`, current app = `--ye-tone2` fill, CSS tooltip with the app name, disabled "Coming soon" tiles for apps with no public web URL (`url: null`), app-provided `bottom` slot (settings + avatar). `--ye-rail-head` aligns the mark with the app's top bar. Additive only: pixel-neutral for existing apps. First consumer: yecalendar.
## 2026-10-16
- Font: Geist → platform system font. `--ye-font-family` is now the system-ui stack; removed `fonts/Geist-*` (woff2/ttf/OFL) and `fonts.css` @font-face. Kotlin `FONT_FAMILY = "sans-serif"`; Android apps use `FontFamily.Default` (no `res/font/geist.ttf`, no Gradle font copy). Type scale (4 styles) unchanged.
- Desktop compact controls (≥900px, fine pointer): pill/iconbtn/textbtn/toast-action 48→40, chip 40→36 (36px floor), padding-x −4px (pill 20→16, chip 16→12, toast-action 12→8). New vars `--ye-ctl-h`, `--ye-ctl-px`, `--ye-ctl-chip-h` for app-owned inputs. Mobile unchanged.
## 0.1.0 — 2026-10-15
- Tokens (DTCG + Style Dictionary 4.4) → CSS/TS/Kotlin for `base` and `yephotos`; unified springs (docs/DECISIONS.md).
- `@yeds/ui-react`: primitives + ui.css extracted 1:1 from yephotos; motion (from yephotos/yeplayer motion.ts, values from tokens); Tabler `createIcon`; i18n (en default, ru).
- Android WebView template (from yephotos/android) + generator; verified `assembleDebug`.
- Scripts: safe-install, sign-apk, create-shared-key, migrate-to-shared-key (prepared only), shotdiff.
- First consumer: yephotos (submodule `frontend/ye-design-system`).
