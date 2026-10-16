/**
 * ye-design-system primitives — the ONLY place buttons/rows/chips/sheets/toasts are born.
 * Canon: hit target >= 48 px (primary 56), pills ONLY for controls, surfaces r1/r2/r3 (12/20/28), no shadows,
 * at rest a control is filled OR outlined (never both), three text styles (title/body/caption), monochrome.
 * Icons are passed as nodes (apps wrap these with their own createIcon map). Copy comes from the app (i18n).
 * Extracted from yephotos frontend/src/ui.tsx (2026-10-15); class names are `ye-*`, styles in ui.css.
 */
import { useEffect, useRef, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'

type Press = { onPointerDown?: () => void; onPointerUp?: () => void }

/** Round 48×48 icon button. tone="overlay" → on top of media. */
export function IconBtn({ icon, label, onClick, active, disabled, href, tone, className = '' }: { icon: ReactNode; label: string; onClick?: () => void; active?: boolean; disabled?: boolean; href?: string; tone?: 'overlay'; className?: string }) {
  const cls = 'ye-iconbtn' + (active ? ' is-active' : '') + (tone ? ' ye-iconbtn-' + tone : '') + (className ? ' ' + className : '')
  if (href) return <a className={cls} href={href} download aria-label={label} title={label}>{icon}</a>
  return <button type="button" className={cls} aria-label={label} title={label} aria-pressed={active === undefined ? undefined : active} onClick={onClick} disabled={disabled}>{icon}</button>
}

export type PillKind = 'primary' | 'secondary' | 'danger' | 'ghost'
/** 48 px pill: primary (fill fg) / secondary (tonal fill) / ghost (none) / danger (fill). Never fill + outline. */
export function Pill({ children, onClick, kind = 'secondary', icon, type = 'button', disabled, pressed, ...press }: { children: ReactNode; onClick?: () => void; kind?: PillKind; icon?: ReactNode; type?: 'button' | 'submit'; disabled?: boolean; pressed?: boolean } & Press) {
  return <button type={type} className={'ye-pill ye-pill-' + kind + (pressed ? ' is-on' : '')} aria-pressed={pressed} onClick={onClick} disabled={disabled} {...press}>{icon}<span>{children}</span></button>
}

/** List row >= 56 px: icon/thumb · title · meta · action. */
export function ListItem({ icon, thumb, title, meta, onClick, action, dense }: { icon?: ReactNode; thumb?: string; title: ReactNode; meta?: ReactNode; onClick?: () => void; action?: ReactNode; dense?: boolean }) {
  const body = <>{thumb ? <img className="ye-listitem-thumb" src={thumb} alt="" loading="lazy" /> : icon ?? null}<span className="ye-listitem-title">{title}</span>{meta !== undefined && <span className="ye-muted">{meta}</span>}</>
  const cls = 'ye-listitem' + (dense ? ' ye-listitem-dense' : '')
  if (onClick && !action) return <button type="button" className={cls} onClick={onClick}>{body}</button>
  return <div className={cls}>{body}{action}</div>
}

/** Filter chip: outline at rest, fill when on. Visual 40 px, hit area 48 (hit padding outside layout). */
export const Chip = ({ children, on, onClick }: { children: ReactNode; on?: boolean; onClick: () => void }) => (
  <button type="button" className={'ye-chip' + (on ? ' is-on' : '')} aria-pressed={!!on} onClick={onClick}>{children}</button>
)

/** Navigation tab (bottom bar / side rail): icon + label, >= 56×64. */
export const NavTab = ({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button type="button" className={'ye-tab' + (active ? ' is-active' : '')} aria-current={active ? 'page' : undefined} onClick={onClick}>{icon}<span>{label}</span></button>
)

/** Cover card: square r2 + caption. */
export const Card = ({ cover, icon, title, meta, onClick }: { cover?: string; icon: ReactNode; title: string; meta?: ReactNode; onClick: () => void }) => (
  <button type="button" className="ye-card" onClick={onClick}>
    <div className="ye-card-cover">{cover ? <img src={cover} alt="" loading="lazy" /> : icon}</div>
    <span className="ye-card-title">{title}</span>{meta && <span className="ye-muted">{meta}</span>}
  </button>
)

/** 48 px text button (breadcrumbs). */
export const TextBtn = ({ children, onClick, current }: { children: ReactNode; onClick: () => void; current?: boolean }) => (
  <button type="button" className="ye-textbtn" onClick={onClick} aria-current={current ? 'page' : undefined}>{children}</button>
)

/** Sticky top bar; `back` is a ready node (usually an IconBtn wired to the app back stack). */
export function TopBar({ title, sub, back, actions }: { title: ReactNode; sub?: ReactNode; back?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ye-topbar">
      {back}
      <div className="ye-topbar-title"><h1>{title}</h1>{sub && <p className="ye-muted">{sub}</p>}</div>
      <div className="ye-topbar-actions">{actions}</div>
    </header>
  )
}

/** Sheet/dialog: bottom on phone, centred on desktop. Esc and scrim tap close; focus is restored. */
export function Sheet({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title: string; children?: ReactNode; actions?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    addEventListener('keydown', k, true)
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input, button')?.focus(), 30)
    return () => { removeEventListener('keydown', k, true); prev?.focus?.() }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="ye-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="ye-sheet" role="dialog" aria-modal aria-label={title}>
        <h2 className="ye-sheet-title">{title}</h2>
        {children}
        {actions && <div className="ye-sheet-actions">{actions}</div>}
      </div>
    </div>
  )
}

export type Toast = { id: number | string; text: ReactNode; action?: { label: string; run: () => void } }
export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="ye-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="ye-toast"><span>{t.text}</span>{t.action && <button type="button" className="ye-toast-action" onClick={t.action.run}>{t.action.label}</button>}</div>
      ))}
    </div>
  )
}

export const Empty = ({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) => (
  <div className="ye-empty">{icon}<h2>{title}</h2>{text && <p className="ye-muted">{text}</p>}{action}</div>
)
export const Loading = ({ label = 'Loading' }: { label?: string }) => <div className="ye-loading" aria-label={label}><span /></div>

/** The three text styles. Nothing else sets font-size. */
export const Text = ({ as: Tag = 'p', kind = 'body', children, className = '' }: { as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div'; kind?: 'title' | 'body' | 'caption'; children: ReactNode; className?: string }) => (
  <Tag className={`ye-text-${kind}${className ? ' ' + className : ''}`}>{children}</Tag>
)

/** Text field: OUTLINE at rest (transparent, 1px --ye-field-line), pill, compact on desktop. Also for date/number/email/combobox inputs. */
export const Field = ({ className = '', ...p }: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={'ye-field' + (className ? ' ' + className : '')} />
/** Multiline field: outline, radius r1 (12). */
export const TextArea = ({ className = '', ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={'ye-field' + (className ? ' ' + className : '')} />
/** Native select: outline + chevron. */
export const Select = ({ className = '', children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={'ye-field' + (className ? ' ' + className : '')}>{children}</select>
/** Search field: FILLED (--ye-search-fill, no border) — acts almost like a button. */
export const Search = ({ className = '', type = 'search', ...p }: InputHTMLAttributes<HTMLInputElement>) => <input type={type} {...p} className={'ye-search' + (className ? ' ' + className : '')} />
