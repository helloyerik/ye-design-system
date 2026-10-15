import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSync } from 'esbuild'
const out = buildSync({ entryPoints: [new URL('../packages/ui-react/src/i18n.ts', import.meta.url).pathname], bundle: true, format: 'esm', write: false }).outputFiles[0].text
const { createT, pickLocale, missingKeys } = await import('data:text/javascript;base64,' + Buffer.from(out).toString('base64'))
const en = { hi: 'Hello {name}', items: { one: '{n} item', other: '{n} items' }, only_en: 'English' }
const ru = { hi: 'Привет, {name}', items: { one: '{n} элемент', few: '{n} элемента', many: '{n} элементов', other: '{n} элемента' } }
test('english default', () => { assert.equal(pickLocale(null), 'en'); assert.equal(pickLocale('fr'), 'en'); assert.equal(pickLocale('ru'), 'ru') })
test('placeholders and plurals', () => {
  const t = createT({ en, ru }, 'ru'); assert.equal(t('hi', { name: 'Ерик' }), 'Привет, Ерик')
  assert.equal(t('items', { n: 1 }), '1 элемент'); assert.equal(t('items', { n: 3 }), '3 элемента'); assert.equal(t('items', { n: 5 }), '5 элементов')
  assert.equal(createT({ en })('items', { n: 2 }), '2 items')
})
test('fallback to en, then key', () => { const t = createT({ en, ru }, 'ru'); assert.equal(t('only_en'), 'English'); assert.equal(t('nope'), 'nope') })
test('missingKeys', () => assert.deepEqual(missingKeys(en, ru), ['only_en']))
