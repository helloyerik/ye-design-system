/**
 * Motion for web ye-apps. Curves, durations and springs come from tokens (tokens/base/motion.json);
 * this file adds the runtime helpers (CSS linear() springs, rAF spring with velocity, velocity tracker).
 * Rules: animate transform/opacity only; enter/exit ease-out, on-screen moves ease-in-out, never ease-in;
 * UI <= 300 ms, exit faster; drag release = spring; reduced motion = opacity only.
 * Extracted from yephotos/yeplayer src/motion.ts (2026-10-15).
 */
import { tokens } from '../../../build/base/tokens'

const m = tokens
export const EASE = {
  out: m.ease.out,
  inOut: m.ease['in-out'],
  drawer: m.ease.drawer,
  hover: 'ease',
  emphasized: m.ease.emphasized,
} as const

/** M3 scale: short 100–200 ms, medium 250–400 ms; exit faster. */
export const M3_DUR = { short1: 100, short2: 150, short3: 200, medium1: 250, medium2: 300, medium4: 400, exit: 200 } as const

export const DUR = {
  press: m.dur.press, hover: m.dur.hover, swap: m.dur.swap, tooltip: m.dur.tooltip,
  popover: m.dur.popover, popoverExit: m.dur['popover-exit'], modal: m.dur.modal, modalExit: m.dur['modal-exit'],
  drawer: m.dur.drawer, drawerExit: m.dur['drawer-exit'], toast: m.dur.toast, expand: m.dur.expand, collapse: m.dur.collapse,
  page: m.dur.page, pageBack: m.dur['page-back'],
} as const

export const PAGE_SHIFT = m.gesture['page-shift']

/**
 * Пружина в стиле Apple ({ duration, bounce }) → CSS-кривая linear() и полная длительность до покоя.
 * Нужна там, где скилл просит пружину (отпускание перетаскивания, «живая» реакция), без библиотек:
 * linear() понимают и CSS, и WAAPI (Chrome 113+, Safari 17.2+, Firefox 112+).
 */
export function spring(duration: number, bounce: number) {
  const omega = (2 * Math.PI) / duration
  const zeta = 1 - bounce // bounce 0 — критическое затухание
  const wd = omega * Math.sqrt(Math.max(1e-6, 1 - zeta * zeta))
  const x = (t: number) =>
    zeta >= 1
      ? 1 - (1 + omega * t) * Math.exp(-omega * t)
      : 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t))
  // время до покоя: последний момент, когда отклонение > 0.1 %
  let settle = duration
  for (let t = 0; t < 4 * duration; t += 0.005) if (Math.abs(1 - x(t)) > 0.001) settle = t
  const n = 40
  const pts = Array.from({ length: n + 1 }, (_, i) => +x((settle * i) / n).toFixed(4))
  pts[n] = 1
  return { easing: `linear(${pts.join(', ')})`, ms: Math.round(settle * 1000) }
}

/** Отпускание перетаскивания (развёрнутый плеер, мини-плеер): лёгкий «отскок», как просит скилл для drag. */
export const SPRING_DRAG = spring(m.spring.drag.duration, m.spring.drag.bounce)
/** «Лайк»: заполненное сердечко появляется с едва заметным перелётом — редкое действие, можно чуть «живее». */
export const SPRING_POP = spring(m.spring.pop.duration, m.spring.pop.bounce)

/** Смахивание считается «броском», если скорость выше этой (px/мс) — тогда закрываем независимо от пути. */
export const FLICK_VELOCITY = m.gesture['flick-px-per-ms']

/** Перетаскивание за естественную границу: чем дальше, тем меньше сдвиг (трение вместо стены). */
export const rubberBand = (d: number, limit = 80) => Math.sign(d) * (1 - 1 / ((Math.abs(d) * 0.55) / limit + 1)) * limit

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** CSS custom properties for an app theme, same values as TS. `prefix` e.g. '--yp' (legacy) or '--ye'. */
export function motionVars(prefix = '--ye'): Record<string, string> {
  return {
    [`${prefix}-ease-out`]: EASE.out,
    [`${prefix}-ease-in-out`]: EASE.inOut,
    [`${prefix}-ease-drawer`]: EASE.drawer,
    [`${prefix}-ease-emphasized`]: EASE.emphasized,
    ...Object.fromEntries(Object.entries(M3_DUR).map(([k, v]) => [`${prefix}-dur-${k.replace(/(\d)/, '-$1')}`, `${v}ms`])),
    [`${prefix}-spring-pop`]: SPRING_POP.easing,
    [`${prefix}-spring-pop-dur`]: `${SPRING_POP.ms}ms`,
    ...Object.fromEntries(Object.entries(DUR).map(([k, v]) => [`${prefix}-dur-${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`, `${v}ms`])),
  }
}

/** Единая кривая для не-жестовых переходов (вход/выход шторок, страниц, тостов, поиска): «iOS-шторка». */
export const EASE_UI = EASE.drawer

/**
 * Пружина на rAF с передачей скорости: значение продолжает движение с ТЕКУЩЕГО места и с той скоростью,
 * с какой палец его отпустил, — без скачка к началу перехода и без «перезапуска с нуля».
 * Скорость — в единицах/мс (px/ms для сдвигов). Интегрируется аналитически-устойчиво мелкими шагами (≤ 4 мс),
 * поэтому не зависит от частоты кадров. reduced motion — сразу в конечное значение.
 * Возвращает stop(): прерывает анимацию на текущем значении (для перехвата новым жестом).
 */
export type SpringOpts = {
  from: number
  to: number
  velocity?: number
  /** жёсткость и затухание: по умолчанию — почти критическое затухание, ~300 мс до покоя */
  stiffness?: number
  damping?: number
  onUpdate: (v: number) => void
  onDone?: () => void
}
export function springTo(o: SpringOpts): { stop: () => number } {
  const k = o.stiffness ?? 380
  const c = o.damping ?? 2 * Math.sqrt(k) * 0.95
  let x = o.from
  let v = (o.velocity ?? 0) * 1000 // → единиц/с
  let raf = 0
  let last = 0
  let done = false
  const finish = () => {
    done = true
    x = o.to
    o.onUpdate(o.to)
    o.onDone?.()
  }
  if (reducedMotion() || (Math.abs(o.to - o.from) < 0.5 && Math.abs(v) < 10)) {
    finish()
    return { stop: () => x }
  }
  const step = (now: number) => {
    if (done) return
    let dt = last ? Math.min(0.064, (now - last) / 1000) : 1 / 60
    last = now
    while (dt > 0) {
      const h = Math.min(dt, 0.004)
      const a = -k * (x - o.to) - c * v
      v += a * h
      x += v * h
      dt -= h
    }
    if (Math.abs(x - o.to) < 0.3 && Math.abs(v) < 20) return finish()
    o.onUpdate(x)
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return {
    stop: () => {
      done = true
      cancelAnimationFrame(raf)
      return x
    },
  }
}

/** Скорость пальца по последним ~80 мс (px/ms): для передачи в springTo. */
export function velocityTracker() {
  let s: { p: number; t: number }[] = []
  return {
    reset(p: number) {
      s = [{ p, t: performance.now() }]
    },
    add(p: number) {
      const t = performance.now()
      s.push({ p, t })
      while (s.length > 2 && t - s[0].t > 80) s.shift()
    },
    get(): number {
      if (s.length < 2) return 0
      const a = s[0]
      const b = s[s.length - 1]
      // палец остановился перед отпусканием — скорости нет
      if (performance.now() - b.t > 60 || b.t - a.t < 1) return 0
      return (b.p - a.p) / (b.t - a.t)
    },
  }
}
