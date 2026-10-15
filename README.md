# ye-design-system

Shared design system + app plumbing for all ye-apps: yeplayer, yephotos (React + WebView APK), yereader, yetube (Kotlin/Compose).
Consumed as a **git submodule** at `<app>/frontend/ye-design-system` (web) or `<app>/ye-design-system` (native). Not published to npm.
Not related to the public GitHub repo `helloyerik/yedesign-system` (Vue, March 2026). Do not touch or confuse it.

| Path | What |
|---|---|
| `tokens/base/*.json` | Single source (DTCG): colour (light/dark), radius, size, space, 3 text styles, motion (ease, dur, springs, gesture) |
| `tokens/apps/<app>.json` | Per-app deviations (documented, to converge) |
| `tokens/build.mjs` | Style Dictionary v4 → `build/<app>/tokens.css` (`--ye-*`), `tokens.ts`, `YeTokens.kt` |
| `packages/ui-react` (`@yeds/ui-react`) | Primitives (IconBtn, Pill, ListItem, Chip, NavTab, Card, TextBtn, TopBar, Sheet, Toasts, Empty, Loading, Text), `ui.css`, `motion`, Tabler `createIcon`, `i18n` |
| `android/webview-template` | WebView wrapper (insets, theme, back, file upload, server URL setup, shared signing) |
| `android/compose` | Compose: generated `YeTokens.kt` now; `ye-compose-ui` module next (from yereader `:core:ui`) |
| `scripts/` | `safe-install.sh`, `sign-apk.sh`, `create-shared-key.sh`, `migrate-to-shared-key.sh` (prepared, not run), `new-webview-app.sh`, `shotdiff.py` |
| `docs/` | DECISIONS (Figtree, Tabler, springs), signing, selfhost (ThinkPad T470), i18n, adopting |

```bash
npm ci && npm run tokens   # regenerate build/ (committed; consumers need no npm)
npm test                   # tokens + i18n + primitives canon checks
npm run check              # tokens are up to date + tests
```
Agents: read `AGENTS.md` first.

**Content-edge alignment:** align to visible content edges, never to an invisible bounding box or empty padding zone. Active/hover pills hug icon+label (hit-target padding only). Columns and amounts align to the content, not a floating max-width gutter. See `docs/DECISIONS.md`.

