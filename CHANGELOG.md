# Changelog
## 0.1.0 — 2026-10-15
- Tokens (DTCG + Style Dictionary 4.4) → CSS/TS/Kotlin for `base` and `yephotos`; unified springs (docs/DECISIONS.md).
- `@yeds/ui-react`: primitives + ui.css extracted 1:1 from yephotos; motion (from yephotos/yeplayer motion.ts, values from tokens); Tabler `createIcon`; i18n (en default, ru).
- Android WebView template (from yephotos/android) + generator; verified `assembleDebug`.
- Scripts: safe-install, sign-apk, create-shared-key, migrate-to-shared-key (prepared only), shotdiff.
- First consumer: yephotos (submodule `frontend/ye-design-system`).
