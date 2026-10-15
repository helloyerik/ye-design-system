# Adopting in a web app (done for yephotos)

1. `git submodule add <url> frontend/ye-design-system` (now a local path; switch the URL to the GitHub repo once it exists: `git submodule set-url`).
2. `vite.config.ts`: alias `@yeds/ui-react` (+ `/motion`, `/i18n`) to the source, and `dedupe: ['react','react-dom','@tabler/icons-react']`. `tsconfig.app.json`: matching `paths`.
3. `main.tsx`: import `ye-design-system/build/<app>/tokens.css` and `packages/ui-react/src/ui.css` **before** the app CSS.
4. Rename the app's primitive classes and token vars to `ye-*`. Remove the duplicated token blocks. Map layout hooks (`--ye-inset-bottom`, `--ye-toast-bottom`).
5. Keep a thin `ui.tsx` that maps icon names → `createIcon(MAP)` and connects store-bound pieces (TopBar back, Toasts).
6. Gate: build, lint, every e2e green, and `scripts/shotdiff.py base after` shows only data diffs (timestamps, free space).
