# WebView wrapper template

Source: yephotos/android (2026-10-15), generalised. One Activity, no dependencies.

- Server URL is configurable: first-run setup screen (`assets/setup.html`), launcher shortcut "Server address", build default `-PyeServer=http://t470:8790` (Tailscale MagicDNS name of the ThinkPad).
- Edge-to-edge; system-bar insets → CSS `--ye-inset-top|bottom|left|right` (ye-design-system contract; apps map them to their layout).
- Theme follows the system (`prefers-color-scheme`), bar icon colour by uiMode, no algorithmic darkening.
- Back: `window.yeBack()` (app back stack) → WebView history → exit. Predictive back on API 33+.
- File upload: system picker, multiple, `image/*,video/*` (adjust in `Chrome.onShowFileChooser`).
- Signing: shared owner key via `~/.ye-keys/keystore.properties` (see `../../docs/signing.md`).
- Later: Media3 MediaSessionService bridge for background audio (yeplayer), pattern from yetube `player/PlaybackService.kt`.

Generate an app: `../../scripts/new-webview-app.sh <name> <applicationId> [default-server] <out-dir>`.
