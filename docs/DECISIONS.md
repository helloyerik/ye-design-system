# Decisions (owner-approved 2026-10-15)

- **Name:** ye-design-system, packages `@yeds/*`, submodule path `ye-design-system`. Unrelated to public `helloyerik/yedesign-system` (Vue).
- **Font:** platform system font everywhere (2026-10-16, replaces Geist). Web: `--ye-font-family` = `system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Ubuntu Sans", Ubuntu, Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`; no font files, no `@font-face`. Android: `FontFamily.Default` (sans-serif / Roboto), no bundled TTF. The 4 text styles (body 16, muted 14, h1, h2) are unchanged. Reader serif stays a reader-only exception.
- **Icons:** Tabler everywhere (yeplayer's Astryx icon registry is re-pointed to Tabler, as yephotos already does).
- **i18n:** English default; Russian kept as the secondary `ru` locale.
- **Signing:** one shared key, manual signing on one machine, no CI secrets.
- **Key migration:** one-time reinstall with data backup; scripts prepared, nothing reinstalled yet.
- **Distribution:** git submodule (no package registry).
- **Self-hosting:** all data on the ThinkPad T470 (Omarchy/Arch), reached over Tailscale; see `selfhost.md`.

## Springs

Native code had two sets: yereader `release 0.82/520`, `pressUp 0.6/500`; yetube (owner-locked in `docs/DECISIONS.md`) settle `0.9/600`, press-up `0.65/500`. Unified roles (`tokens/base/motion.json`):

| Role | dampingRatio / stiffness | Notes |
|---|---|---|
| settle | 0.9 / 600 | sheets, drag settle (yetube owner-locked; equals yereader `sheetSettle`). Replaces yereader `release 0.82/520` |
| swipe | 0.85 / 600 | list row spring-back (yereader `swipeReturn`) |
| press-down / press-up | 1 / 1500, 0.65 / 500 | press scale 0.97. Press-up follows yetube (owner-locked) |
| page | 1 / 400 | reader page turn |
| drag (web) | duration 0.45 s, bounce 0.15 (= 0.85 / ~195) | web expanded-player release; unchanged |
| pop (web) | duration 0.35 s, bounce 0.3 (= 0.7 / ~322) | like-heart; unchanged |

Web keeps exact Apple-style `{duration, bounce}` values so yephotos/yeplayer stay pixel-identical; native gets `{dampingRatio, stiffness}`. The build converts both ways (`springNorm`). Commit fling is 1250 dp/s; web flick is 0.11 px/ms.

## Known deviations (to converge, each needs owner OK + screenshots)

- yephotos type 22/15/13 (canon 24/16/14): `tokens/apps/yephotos.json`.
- yephotos keeps app-level vars `--yp-tab-h`, `--yp-st/sb`, `--yp-tile-bg`, `--yp-scrub-bg` and the Astryx theme (`--yp-ease-*` via `motionVars('--yp')`).

## Content-edge alignment (2026-10-15)

Owner rule, locked:

> Align elements to visible content edges, never to an invisible bounding box or empty padding zone. Active/hover pills hug icon+label (only enough padding for the 44–48px hit target). Columns and amounts align to the content, not a floating max-width gutter.

Also keep: at rest fill OR outline never both; only controls are pills 999px; surfaces 12/20/28; system font + Tabler; English UI.

Do not set sidebar nav items to `width: 100%` / stretch them in a column flex rail. Use `width: fit-content` (or `align-items: flex-start` on the rail) so the active pill hugs the label.

## Type scale (2026-10-15)

**Type scale (locked):** only (1) body 16px, (2) secondary/muted caption 14px gray, (3) h1 page title, (4) h2 section titles. No 12px captions, no 20/22/24 midtitles, no third body size. A page’s primary money figure (Overview net worth, entry amount) may use h1 scale — that is not a fifth general style.
