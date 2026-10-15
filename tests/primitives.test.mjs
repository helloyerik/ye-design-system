// Static canon checks on the React primitives + ui.css (no DOM needed).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('../packages/ui-react/src/ui.css', import.meta.url), 'utf8')
const rule = (sel) => (css.match(new RegExp('^' + sel.replace(/[.[\]]/g, '\\$&') + ' \\{([^}]*)\\}', 'm')) || [])[1] || ''
test('no shadows anywhere', () => assert.doesNotMatch(css, /box-shadow:(?!\s*none)/))
test('pill radius only on controls', () => {
  for (const m of css.matchAll(/^([^{]+)\{[^}]*var\(--ye-radius-pill\)/gm)) assert.match(m[1], /ye-(pill|chip|toast-action)/, m[1])
})
test('controls >= 48', () => { for (const s of ['.ye-pill', '.ye-textbtn', '.ye-toast-action']) assert.match(rule(s), /min-height: var\(--ye-size-touch\)/, s); assert.match(rule('.ye-iconbtn'), /width: var\(--ye-size-touch\)/) })
test('fill OR outline: chip outlined at rest; filled when on (border = same colour)', () => {
  assert.match(rule('.ye-chip'), /border: 1px solid/); assert.doesNotMatch(rule('.ye-chip'), /background/)
  assert.match(rule('.ye-chip.is-on'), /border-color: var\(--ye-fg\)/)
  for (const k of ['primary', 'secondary', 'danger']) assert.doesNotMatch(rule('.ye-pill-' + k), /border/, k)
})
