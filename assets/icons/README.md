# App icon (all ye-apps)
Solid equilateral triangle, monochrome, our own geometry (no third-party asset). Regenerate: `cd assets/icons && python3 ../../scripts/gen-icons.py`.
- `triangle.svg` — favicon, follows theme (black on white / white on black via prefers-color-scheme), rounded square.
- `favicon.ico` (16/32/48), `favicon-32.png` — black on white.
- `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` — white on black. `icon-maskable-*.png` — triangle inside the 80% safe zone.
- `android/` — copy into `app/src/main/res/`: adaptive icon (background #000, white triangle foreground + monochrome for themed icons) and legacy mipmaps mdpi…xxxhdpi (+ round).
- `triangle-mark.svg` — bare triangle in `currentColor` for in-app use.
- `preview.png` — overview.
