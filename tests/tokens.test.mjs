import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { springCss, springNorm } from '../tokens/build.mjs'

const apps = readdirSync(new URL('../build', import.meta.url))
const css = (a) => readFileSync(new URL(`../build/${a}/tokens.css`, import.meta.url), 'utf8')
const blocks = (s) => [...s.matchAll(/\{ (--ye-bg[^}]*) \}/g)].map((m) => m[1])

test('every app build has css, ts, kotlin', () => {
  for (const a of apps) for (const f of ['tokens.css', 'tokens.ts', 'YeTokens.kt']) assert.ok(readFileSync(new URL(`../build/${a}/${f}`, import.meta.url), 'utf8').length > 100, `${a}/${f}`)
})
test('two dark blocks are identical, light differs, page is black in dark', () => {
  for (const a of apps) { const [light, dark1, dark2] = blocks(css(a)); assert.equal(dark1, dark2); assert.notEqual(light, dark1); assert.match(dark1, /--ye-bg: #000000;/) }
})
test('pill radius exists; four locked type styles (+ title/caption aliases)', () => {
  const s = css('base'); assert.match(s, /--ye-radius-pill: 999px/)
  const styles = new Set([...s.matchAll(/--ye-type-(\w+)-size/g)].map((m) => m[1]))
  for (const k of ['h1', 'h2', 'body', 'muted']) assert.ok(styles.has(k), k)
  // aliases kept one release
  assert.ok(styles.has('title') && styles.has('caption'))
  assert.match(s, /--ye-type-body-size: 16px/)
  assert.match(s, /--ye-type-muted-size: 14px/)
  assert.match(s, /--ye-radius-r0: 12px/) // was 8; now alias of r1
  assert.match(s, /--ye-radius-r1: 12px/)
})
test('touch target >= 48', () => assert.match(css('base'), /--ye-size-touch: 48px/))
test('spring conversions round-trip and match legacy web springs', () => {
  const pop = springNorm({ duration: 0.35, bounce: 0.3 }); assert.equal(pop.dampingRatio, 0.7); assert.ok(Math.abs(pop.stiffness - 322.27) < 0.01)
  const s = springNorm({ dampingRatio: 0.9, stiffness: 600 }); assert.ok(Math.abs(s.duration - 0.2565) < 0.001)
  assert.match(springCss({ duration: 0.35, bounce: 0.3 }).easing, /^linear\(0, /)
})
test('kotlin has no raw rgba and colours are ARGB', () => {
  const k = readFileSync(new URL('../build/base/YeTokens.kt', import.meta.url), 'utf8')
  assert.doesNotMatch(k, /rgba/); assert.match(k, /val dim = Color\(0x99000000\)/); assert.match(k, /fun <T> settle\(\) = spring<T>\(dampingRatio = 0.9f, stiffness = 600f\)/)
})
test('field outline tokens exist in every theme block', () => {
  for (const a of apps) for (const b of blocks(css(a))) for (const k of ['field-line', 'field-line-focus', 'search-fill']) assert.match(b, new RegExp('--ye-' + k + ':'), a + ' ' + k)
})
