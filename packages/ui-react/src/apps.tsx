/**
 * ye-apps switcher rail (Yandex 360 layout, our canon): a narrow fixed column on desktop — suite mark on top,
 * one 40 px icon tile per ye-app (current = light fill, monochrome), a tooltip with the app name on hover/focus,
 * and an app-provided bottom slot (settings + avatar). Apps without a public web URL render disabled ("Coming soon").
 * URLs are verified production URLs (primary: <app>.yerik.xyz, else the Vercel URL); never invent one — leave `url: null` until the app is deployed.
 * Mobile: do not render the rail (apps may list YE_APPS in their drawer instead).
 */
import type { ComponentType, ReactNode } from 'react'
import { IconCalendar, IconWallet, IconFocus2, IconMusic, IconPhoto, IconBook, IconMovie, IconTransform, IconFlower } from '@tabler/icons-react'
import { ICON_STROKE } from './icons'

type TablerLike = ComponentType<{ size?: number | string; stroke?: number | string; 'aria-hidden'?: boolean }>
export type YeAppId = 'yecalendar' | 'yetracker' | 'yefocus' | 'yeplayer' | 'yeconvert' | 'yejournal' | 'yephotos' | 'yereader' | 'yetube'
export type YeApp = { id: YeAppId; name: string; icon: TablerLike; url: string | null }

export const YE_APPS: readonly YeApp[] = [
  { id: 'yecalendar', name: 'Yecalendar', icon: IconCalendar, url: 'https://calendar.yerik.xyz' },
  { id: 'yetracker', name: 'Yetracker', icon: IconWallet, url: 'https://tracker.yerik.xyz' },
  { id: 'yefocus', name: 'Yefocus', icon: IconFocus2, url: 'https://yefocus.vercel.app' },
  { id: 'yeplayer', name: 'Yeplayer', icon: IconMusic, url: 'https://yeplayer.vercel.app' },
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

export function AppRail({ current, apps = YE_APPS, label = 'Ye apps', soon = 'Coming soon', bottom, className = '' }: {
  current: YeAppId; apps?: readonly YeApp[]; label?: string; soon?: string; bottom?: ReactNode; className?: string
}) {
  return (
    <nav className={'ye-rail ' + className} aria-label={label}>
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
      {bottom && <div className="ye-rail-bottom">{bottom}</div>}
    </nav>
  )
}
