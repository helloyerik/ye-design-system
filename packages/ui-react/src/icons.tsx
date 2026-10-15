/**
 * Tabler icons wrapper (MIT, @tabler/icons-react). One family in every ye-app; stroke 2, 24 px.
 * Each app registers its semantic map once: `export const Icon = createIcon({ back: IconArrowLeft, ... })`.
 * Rule: outline at rest, the *Filled variant for an "on" state (liked, active tab) where Tabler has one.
 */
import type { ComponentType } from 'react'
import { tokens } from '../../../build/base/tokens'

type TablerLike = ComponentType<{ size?: number | string; stroke?: number | string; 'aria-hidden'?: boolean; className?: string }>
export const ICON_SIZE = tokens.size.icon
export const ICON_STROKE = tokens.icon.stroke

export function createIcon<M extends Record<string, TablerLike>>(map: M) {
  function Icon({ name, size = ICON_SIZE, className }: { name: keyof M; size?: number; className?: string }) {
    const C = map[name]
    return <C size={size} stroke={ICON_STROKE} aria-hidden className={className} />
  }
  return Icon
}
