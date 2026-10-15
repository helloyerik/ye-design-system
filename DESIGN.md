# Design canon (all ye-apps)

Source of truth for tokens: `tokens/`. Agent rules: `AGENTS.md`. Owner decisions: `docs/DECISIONS.md`.

## Hard rules

1. Monochrome and flat. Black page in dark mode. No shadows or gradients on surfaces.
2. Only interactive controls are pills (999px). Surfaces use radii 12 / 20 / 28.
3. At rest a control has either a light fill **or** an outline, never both.
4. **Type scale (locked):** only (1) body 16px, (2) secondary/muted caption 14px gray, (3) h1 page title, (4) h2 section titles. No 12px captions, no 20/22/24 midtitles, no third body size. A page’s primary money figure (Overview net worth, entry amount) may use h1 scale — that is not a fifth general style.
5. Hit targets ≥ 48px (primary 56). Invisible hit padding must not affect layout or alignment.
6. **Content-edge alignment.** Align elements to visible content edges, never to an invisible bounding box or empty padding zone. Active/hover pills hug icon+label (only enough padding for the hit target). Columns and amounts align to the content, not a floating max-width gutter.
7. English UI by default.
8. Calm motion: transform and opacity; respect reduced motion.

## Anti-patterns

- Stretching a sidebar nav pill to the full rail width (`width: 100%` or column flex stretch).
- Aligning amounts to a page `max-width` gutter that does not match the visible header/actions edge.
- Padding a row so its text starts further in than the section title above it.
