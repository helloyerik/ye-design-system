# Rules for agents

1. Values live ONLY in `tokens/`. Never hard-code a colour/radius/size/duration in an app; add a token (base) or an app override (`tokens/apps/<app>.json`, with a reason). Run `npm run tokens` and commit `build/`.
2. Canon: black page in dark, monochrome and flat (no shadows/gradients); hit target ≥ 48 px (primary 56); pill radius ONLY on controls; surfaces 12/20/28; at rest a control is **filled OR outlined**, never both; type scale locked to body 16 / caption 14 muted / h1 / h2 (primary money may use h1 scale); Geist; Tabler icons, stroke 2, 24 px, outline at rest / Filled for "on". **Content-edge alignment:** align to visible content edges, never to an invisible bounding box or empty padding zone; active/hover pills hug icon+label (only enough padding for the hit target); columns and amounts align to the content, not a floating max-width gutter.
3. Motion: ease-out for enter/exit, ease-in-out for moves, never ease-in; UI ≤ 300 ms, exit faster; drag release = spring (`spring.*` tokens); reduced motion = opacity only.
4. Copy: English default; Russian only as the `ru` catalog. No inline UI strings in new code; use `createT`.
5. Changes to primitives must be pixel-neutral for existing apps or come with a screenshot diff (`scripts/shotdiff.py`) the owner has seen.
6. Never commit keys. Never `adb uninstall`. Use `scripts/safe-install.sh`. Key migration only with an explicit owner go per app.
7. Kill only your own PIDs; never `pkill` by pattern.

**Type scale (locked):** only (1) body 16px, (2) secondary/muted caption 14px gray, (3) h1 page title, (4) h2 section titles. No 12px captions, no 20/22/24 midtitles, no third body size. A page’s primary money figure (Overview net worth, entry amount) may use h1 scale — that is not a fifth general style.
