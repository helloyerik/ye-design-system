// Static canon checks on the React primitives + ui.css (no DOM needed).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('../packages/ui-react/src/ui.css', import.meta.url), 'utf8')
const rule = (sel) => (css.match(new RegExp('^' + sel.replace(/[.[\]]/g, '\\$&') + ' \\{([^}]*)\\}', 'm')) || [])[1] || ''
test('no shadows anywhere', () => assert.doesNotMatch(css, /box-shadow:(?!\s*none)/))
test('pill radius only on controls', () => {
  for (const m of css.matchAll(/^([^{]+)\{[^}]*var\(--ye-radius-pill\)/gm)) assert.match(m[1], /ye-(pill|chip|toast-action|toast-pill|tab|loading|field|search|seg)/, m[1])
})
test('controls >= 48', () => { for (const s of ['.ye-pill', '.ye-textbtn', '.ye-toast-action']) assert.match(rule(s), /min-height: var\((--ye-[a-z-]+, var\()?--ye-size-touch\)/, s); assert.match(rule('.ye-iconbtn'), /width: var\(--ye-iconbtn-size, var\(--ye-size-touch\)\)/) })
test('fill OR outline: chip outlined at rest; filled when on (border = same colour)', () => {
  assert.match(rule('.ye-chip'), /border: 1px solid/); assert.doesNotMatch(rule('.ye-chip'), /background/)
  assert.match(rule('.ye-chip.is-on'), /border-color: var\(--ye-fg\)/)
  for (const k of ['primary', 'secondary', 'danger']) assert.doesNotMatch(rule('.ye-pill-' + k), /border/, k)
})
test('desktop compact variant: −8px height, ≥36 floor, fine pointer only', () => {
  const m = css.match(/@media \(min-width: 900px\) and \(pointer: fine\) \{([\s\S]*?)\n\}/); assert.ok(m)
  assert.match(m[1], /--ye-ctl-h: calc\(var\(--ye-size-touch\) - 8px\)/); assert.match(m[1], /max\(36px/)
})
test('fields: outline at rest (transparent), search filled (no border), textarea r1', () => {
  assert.match(rule('.ye-field'), /background: transparent; border: 1px solid var\(--ye-field-line\)/)
  assert.match(rule('.ye-search'), /background: var\(--ye-search-fill\); border: 0/)
  assert.match(css, /textarea\.ye-field[^{]*\{[^}]*border-radius: var\(--ye-radius-r1\)/)
})
test('app hooks keep canon defaults', () => {
  assert.match(rule('.ye-pill-primary'), /var\(--ye-pill-primary-bg, var\(--ye-fg\)\)/)
  assert.match(rule('.ye-chip-input'), /background: var\(--ye-chip-input-bg, var\(--ye-tone2\)\)/); assert.doesNotMatch(rule('.ye-chip-input'), /border:/)
})
test('app rail: compact 40 px tiles on desktop, current = fill only, apps never get invented URLs', () => {
  assert.match(rule('.ye-rail'), /--ye-rail-tile: var\(--ye-ctl-h, var\(--ye-size-touch\)\)/)
  assert.match(rule('.ye-rail-item.is-current'), /background: var\(--ye-tone2\)/); assert.doesNotMatch(rule('.ye-rail-item.is-current'), /border/)
  const src = readFileSync(new URL('../packages/ui-react/src/apps.tsx', import.meta.url), 'utf8')
  for (const m of src.matchAll(/url: ('[^']*'|null)/g)) assert.match(m[1], /^(null|'https:\/\/[a-z0-9-]+\.(vercel\.app|yerik\.xyz)')$/)
})
test('app rail: solid --ye-fg glyphs (no opacity/tint), state = fill only, one breakpoint, fixed bottom order', () => {
  const railRules = [...css.matchAll(/^(\.ye-rail[^{]*)\{([^}]*)\}/gm)].filter((m) => !m[1].includes('::after') && !m[1].includes(':hover::'))
  for (const [, sel, body] of railRules) {
    assert.doesNotMatch(body, /opacity: (?!1;)/, sel)
    assert.doesNotMatch(body, /color: var\(--ye-dim\)/, sel)
  }
  assert.match(rule('.ye-rail-item'), /color: var\(--ye-fg\)/)
  assert.doesNotMatch(rule('.ye-rail-item:hover'), /border|outline/)
  assert.match(css, /@media \(max-width: 899\.98px\) \{ \.ye-rail \{ display: none; \} \}/)
  const src = readFileSync(new URL('../packages/ui-react/src/apps.tsx', import.meta.url), 'utf8')
  assert.match(src, /RAIL_MEDIA = '\(min-width: 900px\)'/)
  assert.match(src, /\{settings && <RailButton[\s\S]*\{account\}[\s\S]*\{bottom\}/)
})
