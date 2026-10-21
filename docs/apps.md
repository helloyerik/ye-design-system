# Ye apps: `YE_APPS`, `AppRail`, `YeMark`

Source: `packages/ui-react/src/apps.tsx`. Styles: `.ye-rail*` in `packages/ui-react/src/ui.css`.

## `YE_APPS`
This is the one list of Ye apps, used by the desktop rail and the account page's "Your apps" (https://account.yerik.xyz).

| id | name | url |
|---|---|---|
| `yecalendar` | Yecalendar | https://calendar.yerik.xyz |
| `yetracker` | Yetracker | https://tracker.yerik.xyz (old host https://hexpo.vercel.app still works) |
| `yefocus` | Yefocus | https://yefocus.vercel.app |
| `yeplayer` | Yeplayer | https://yeplayer.vercel.app |
| `yeconvert` | Yeconvert | https://convert.yerik.xyz |
| `yejournal` | Yejournal | https://journal.yerik.xyz |
| `yephotos` · `yereader` · `yetube` | Yephotos · Yereader · Yetube | `null` (shown as "Coming soon") |

Rules:
- Use only verified production URLs: `<app>.yerik.xyz` when it exists, otherwise the Vercel URL. **Never invent one.** Keep `url: null` until the app is deployed.
- When an app moves to `<app>.yerik.xyz`, update its row and the CHANGELOG, then bump the submodule in each consumer.

## `AppRail`
```tsx
import { AppRail, YE_APPS } from '@yeds/ui-react'
<AppRail current="yecalendar" label={t('apps.label')} soon={t('apps.soon')} bottom={<>{settingsBtn}<AccountMenu /></>} />
```
- Desktop only: a narrow fixed column in the Yandex 360 layout. Do not render it on phones; a drawer may list `YE_APPS` instead.
- Layout: the `YeMark` on top, then one 40 px tile per app (`--ye-ctl-h`, Tabler icon, monochrome). A tooltip shows the name on hover and focus. The current app gets a light fill (`aria-current="page"`). Apps with no URL are disabled and the tooltip reads "{name} · Coming soon".
- `bottom`: a slot the app provides, for Settings and the avatar/account.
- Props: `current`, `apps = YE_APPS`, `label = 'Ye apps'`, `soon = 'Coming soon'`, `bottom`, `className`.

## `YeMark`
A solid equilateral triangle in `currentColor` (`assets/icons/triangle-mark.svg`). It is the shared mark on the rail and the account page.

## Shared sign-in
Apps on `*.yerik.xyz` sign in with the shared Ye account. See the `helloyerik/yeaccount` README ("Integrate an app").
