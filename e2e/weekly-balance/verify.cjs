// Isolated browser QA of the real component and stylesheet, without credentials or provider calls.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { chromium } = require('../e4/node_modules/@playwright/test');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, '.auth/weekly-balance');
fs.mkdirSync(output, { recursive: true });
function load(file, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: key => imports[key], AbortSignal, Error });
  return exports;
}
const nutrient = (value, missingItems = 0) => ({ value, average: value, missingItems });
const training = { totalSessions: 4, sessions: { completed: 3, abandoned: 1, in_progress: 0 }, completedSets: 36, setsWithoutRecordedLoad: 4 };
const nutrients = { calories: nutrient(2150), protein: nutrient(110, 1), fat: nutrient(65), carbohydrates: nutrient(240) };
const food = { meals: 12, daysWithRecords: 4, estimatedItems: 2, nutrients };
const days = Array.from({ length: 5 }, (_, i) => ({ date: `2026-01-0${5 + i}`, training: { ...training, totalSessions: i % 2 === 0 ? 1 : 0, sessions: { completed: i % 2 === 0 ? 1 : 0 } },
  food: { ...food, nutrients: { ...nutrients, calories: nutrient(i === 1 ? null : [2100, 0, 2300, 1900, 2300][i]) } }, weight: i === 0 ? { weightKg: 80.2 } : null }));
const report = { period: { elapsedDays: 5, isPartial: true }, current: { training, food, days, weight: { count: 1, averageKg: 80.2, measurements: [{ dateInferred: false }] } } };
const Component = load('src/components/reports/WeeklyAnalysis.tsx', {
  react: { useState: value => [value, () => {}] }, 'react/jsx-runtime': require('react/jsx-runtime'),
  'next/link': { default: props => React.createElement('a', props, props.children) },
  '@/lib/api/client': {}, '@/lib/firebase/client': {}, '@/lib/food': { formatNumber: value => value === null ? 'Sin dato' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value) },
  '@/lib/weekly-balance': load('src/lib/weekly-balance.ts'),
}).default;
const markup = renderToStaticMarkup(React.createElement(Component, { weekStart: '2026-01-05', timeZone: 'UTC', report }));
const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}\n:root{--font-geist:Arial}html{scroll-behavior:auto}</style></head><body><div class="dashboard app-shell"><aside class="app-sidebar" aria-label="Navegación">Formance</aside><main class="dashboard-content"><div class="dashboard-view">${markup}</div></main></div></body></html>`);
      assert.equal(await page.locator('.balance-card').count(), 3);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
      const overflowing = await page.locator('.weekly-analysis *').evaluateAll(elements => elements.filter(el => el.clientWidth && el.scrollWidth > el.clientWidth + 1).map(el => el.className));
      assert.deepEqual(overflowing, [], `Component overflow at ${width}`);
      assert.equal(await page.locator('.balance-detail').getAttribute('open'), null);
      await page.locator('.balance-detail > summary').focus(); await page.keyboard.press('Enter');
      assert.notEqual(await page.locator('.balance-detail').getAttribute('open'), null);
      assert.ok(await page.getByRole('button', { name: 'Consultar detalle' }).isVisible());
      await page.locator('.balance-detail > summary').focus(); await page.keyboard.press('Enter');
      await page.locator('.balance-detail > summary').blur();
      await page.evaluate(() => scrollTo(0, 0));
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `balance-${width}.png`), fullPage: true });
      console.log(`OK ${width}px: 3 cards, no overflow, keyboard expansion`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
