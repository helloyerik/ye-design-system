# Decisions (owner-approved 2026-10-15)

- **Name:** ye-design-system, packages `@yeds/*`, submodule path `ye-design-system`. Unrelated to public `helloyerik/yedesign-system` (Vue).
- **Font:** Figtree everywhere (yeplayer/yereader Inter/Noto move over during their migration; reader serif stays a reader-only exception).
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
