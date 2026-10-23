# Ye apps: `YE_APPS`, `AppRail`, `YeMark`

Source: `packages/ui-react/src/apps.tsx`. Styles: `.ye-rail*` in `packages/ui-react/src/ui.css`.

## `YE_APPS`
This is the one list of Ye apps, used by the desktop rail and the account page's "Your apps" (https://account.yerik.xyz).

| id | name | url |
|---|---|---|
| `yecalendar` | Yecalendar | https://calendar.yerik.xyz |
| `yetracker` | Yetracker | https://tracker.yerik.xyz (https://hexpo.vercel.app redirects here) |
| `yefocus` | Yefocus | https://focus.yerik.xyz |
| `yeplayer` | Yeplayer | https://player.yerik.xyz |
| `yeconvert` | Yeconvert | https://convert.yerik.xyz |
| `yejournal` | Yejournal | https://journal.yerik.xyz |
| `yephotos` · `yereader` · `yetube` | Yephotos · Yereader · Yetube | `null` (shown as "Coming soon") |

Rules:
- Use only verified production URLs: `<app>.yerik.xyz` when it exists, otherwise the Vercel URL. **Never invent one.** Keep `url: null` until the app is deployed.
- When an app moves to `<app>.yerik.xyz`, update its row and the CHANGELOG, then bump the submodule in each consumer.
- Domains, DNS, redirects and the runbook for moving a host: [DOMAINS.md](DOMAINS.md).

## `AppRail`
```tsx
import { AppRail, RailAvatar, useRailVisible } from '@yeds/ui-react'
const desktop = useRailVisible()   // RAIL_MEDIA = '(min-width: 900px)'
{desktop && <AppRail current="yecalendar" label={t('apps.label')} soon={t('apps.soon')}
  settings={{ label: t('nav.settings'), onClick: openSettings }}
  account={<MyAccountMenu trigger={(p) => <RailAvatar label={t('acc.account')} signedIn={signedIn} initial={email[0]} {...p} />} />} />}
```

### Rule: one rail, unmodified, in every app
Every ye-app with a desktop layout (yecalendar, yetracker, yefocus, yeplayer, yeconvert, yejournal, and account.yerik.xyz with `current={null}`) renders this `AppRail` from the submodule **as is**:
- No forked or hand-built rail, and no app CSS that targets `.ye-rail*` (no width, colour, `--ye-rail-*` or position overrides). Do not pass `className` to restyle it.
- Show it with `useRailVisible()` only (one breakpoint, `RAIL_MEDIA`, 900 px). Below that, render no rail; the app's drawer or tab bar takes over. ui.css also hides `.ye-rail` below 900 px.
- The rail is the first child of the app's top-level row. It is `position: sticky; top: 0; z-index: 20; height: 100dvh`, so the app should not size it or wrap it to lift its tooltips (the rail sits above app columns and below `.ye-scrim`).
- The bottom order is fixed: `settings` (a gear tile), then `account` (a menu whose trigger is `<RailAvatar>`), then the legacy `bottom` slot. Use `RailButton` for anything else at the bottom. Never use a bare `IconBtn` there.
- App-specific section navigation (for example Yetracker's Overview / Operations / …) is a separate column to the right of the rail. It is not part of the rail.
- If an app needs something the rail does not offer, add it here (a prop or slot) and bump every consumer. Do not fork it.
- After a change here, bump the submodule in **every** consumer, so all hosts show the same rail.

### Look
- The `YeMark` sits on top in a 52 px head, followed by one 40 px tile per app (`--ye-ctl-h`, Tabler icon, stroke 2, 24 px). The column is tile + 16 px wide.
- Glyphs are solid `--ye-fg` (white on the dark theme, black on light) in every state, including "Coming soon". There is no opacity and no per-app tint, because translucent strokes darken where they overlap.
- State is shown with a fill behind the tile only, and never with an outline at rest: hover is `--ye-tone`, the current app (`aria-current="page"`) is `--ye-tone2`. Disabled ("Coming soon") tiles have no hover fill, and their tooltip reads "{name} · Coming soon".
- `RailAvatar`: a 32 px circle in a tile. Signed out, it shows a user glyph on `--ye-tone2`. Signed in, it shows the initial on a solid `--ye-fg` fill.
- Props: `current?` (`null` = none highlighted), `apps = YE_APPS`, `label = 'Ye apps'`, `soon = 'Coming soon'`, `settings?: { label, onClick, active? }`, `account?`, `bottom?` (legacy), `className`.

## `YeMark`
A solid equilateral triangle in `currentColor` (`assets/icons/triangle-mark.svg`). It is the shared mark on the rail and the account page.

## Shared sign-in
Apps on `*.yerik.xyz` sign in with the shared Ye account. See the `helloyerik/yeaccount` README ("Integrate an app").
