/**
 * ye-apps switcher rail (Yandex 360 layout, our canon): a narrow fixed column on desktop — suite mark on top,
 * one 40 px icon tile per ye-app (current = light fill, monochrome), a tooltip with the app name on hover/focus,
 * and an app-provided bottom slot (settings + avatar). Apps without a public web URL render disabled ("Coming soon").
 * URLs are verified production URLs (primary: <app>.yerik.xyz, else the Vercel URL); never invent one — leave `url: null` until the app is deployed.
 * Mobile: do not render the rail (apps may list YE_APPS in their drawer instead). Gate it with `useRailVisible()` (RAIL_MEDIA);
 * ui.css also hides `.ye-rail` below 900 px. Every ye-app uses this component unmodified (docs/apps.md): no forks, no local `.ye-rail*` CSS.
 * Icons are solid `--ye-fg` (white on dark), never translucent; state is shown with a fill behind the tile only.
 */
import { useSyncExternalStore, type ComponentType, type ReactNode } from 'react'
import { IconCalendar, IconWallet, IconFocus2, IconMusic, IconPhoto, IconBook, IconMovie, IconTransform, IconFlower, IconSettings, IconUser } from '@tabler/icons-react'
import { ICON_STROKE } from './icons'

type TablerLike = ComponentType<{ size?: number | string; stroke?: number | string; 'aria-hidden'?: boolean }>
export type YeAppId = 'yecalendar' | 'yetracker' | 'yefocus' | 'yeplayer' | 'yeconvert' | 'yejournal' | 'yephotos' | 'yereader' | 'yetube'
export type YeApp = { id: YeAppId; name: string; icon: TablerLike; url: string | null }

export const YE_APPS: readonly YeApp[] = [
  { id: 'yecalendar', name: 'Yecalendar', icon: IconCalendar, url: 'https://calendar.yerik.xyz' },
  { id: 'yetracker', name: 'Yetracker', icon: IconWallet, url: 'https://tracker.yerik.xyz' },
  { id: 'yefocus', name: 'Yefocus', icon: IconFocus2, url: 'https://focus.yerik.xyz' },
  { id: 'yeplayer', name: 'Yeplayer', icon: IconMusic, url: 'https://player.yerik.xyz' },
  { id: 'yeconvert', name: 'Yeconvert', icon: IconTransform, url: 'https://convert.yerik.xyz' },
  { id: 'yejournal', name: 'Yejournal', icon: IconFlower, url: 'https://journal.yerik.xyz' },
  { id: 'yephotos', name: 'Yephotos', icon: IconPhoto, url: null },
  { id: 'yereader', name: 'Yereader', icon: IconBook, url: null },
  { id: 'yetube', name: 'Yetube', icon: IconMovie, url: null },
]

/** Solid equilateral triangle — the shared ye-apps mark (assets/icons/triangle-mark.svg), in currentColor. */
export const YeMark = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M12 3.5 22 20.5H2Z" fill="currentColor" /></svg>
)

/** The one desktop breakpoint for the rail. Below it, apps render no rail (drawer/tab bar instead). */
export const RAIL_MEDIA = '(min-width: 900px)'
const railSub = (cb: () => void) => { const m = matchMedia(RAIL_MEDIA); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
/** true on desktop widths (RAIL_MEDIA). Use it to decide whether to render <AppRail>. */
export const useRailVisible = () => useSyncExternalStore(railSub, () => matchMedia(RAIL_MEDIA).matches, () => false)

type RailBtnProps = { label: string; onClick?: () => void; active?: boolean; expanded?: boolean; haspopup?: 'menu' | 'dialog'; title?: string }

/** A rail tile button (same 40 px tile, tooltip and states as the app tiles). For the bottom area only. */
export function RailButton({ icon, label, onClick, active, expanded, haspopup, title }: RailBtnProps & { icon: ReactNode }) {
  return (
    <button type="button" className={'ye-rail-item' + (active ? ' is-current' : '')} aria-label={label} data-tip={title ?? label}
      aria-expanded={expanded} aria-haspopup={haspopup} onClick={onClick}>{icon}</button>
  )
}

/** The account tile: a 32 px circle inside a rail tile. Signed out = user glyph on a tone fill; signed in = initial on a solid fg fill. */
export function RailAvatar({ label, signedIn, initial, onClick, expanded, haspopup = 'menu', title }: RailBtnProps & { signedIn: boolean; initial?: string }) {
  return (
    <button type="button" className={'ye-rail-item ye-rail-avatar' + (signedIn ? ' is-in' : '')} aria-label={label} data-tip={title ?? label}
      aria-expanded={expanded} aria-haspopup={haspopup} onClick={onClick}>
      <span className="ye-rail-avatar-dot">{signedIn && initial ? initial.slice(0, 1).toUpperCase() : <IconUser size={20} stroke={ICON_STROKE} aria-hidden />}</span>
    </button>
  )
}

/**
 * Bottom area order is fixed for every app: `settings` tile, then `account` (usually a menu wrapping <RailAvatar>), then the legacy `bottom` slot.
 * `current` is optional (null for hosts that are not in YE_APPS, such as account.yerik.xyz).
 */
export function AppRail({ current = null, apps = YE_APPS, label = 'Ye apps', soon = 'Coming soon', settings, account, bottom, className = '' }: {
  current?: YeAppId | null; apps?: readonly YeApp[]; label?: string; soon?: string
  settings?: { label: string; onClick: () => void; active?: boolean }; account?: ReactNode; bottom?: ReactNode; className?: string
}) {
  const hasBottom = settings || account || bottom
  return (
    <nav className={'ye-rail' + (className ? ' ' + className : '')} aria-label={label}>
      <span className="ye-rail-mark"><YeMark /></span>
      <ul className="ye-rail-list">
        {apps.map((a) => {
          const I = a.icon, on = a.id === current
          const tip = a.url || on ? a.name : `${a.name} · ${soon}`
          return (
            <li key={a.id}>
              {a.url && !on
                ? <a className="ye-rail-item" href={a.url} aria-label={a.name} data-tip={tip}><I size={24} stroke={ICON_STROKE} aria-hidden /></a>
                : <a className={'ye-rail-item' + (on ? ' is-current' : ' is-disabled')} aria-current={on ? 'page' : undefined} aria-disabled={on ? undefined : true} aria-label={tip} data-tip={tip} tabIndex={on ? undefined : 0}>
                    <I size={24} stroke={ICON_STROKE} aria-hidden />
                  </a>}
            </li>
          )
        })}
      </ul>
      {hasBottom && <div className="ye-rail-bottom">
        {settings && <RailButton icon={<IconSettings size={24} stroke={ICON_STROKE} aria-hidden />} label={settings.label} onClick={settings.onClick} active={settings.active} />}
        {account}
        {bottom}
      </div>}
    </nav>
  )
}
