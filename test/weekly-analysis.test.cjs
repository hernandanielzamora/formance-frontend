const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Execute the real component and its click callback with a small hook driver,
// following the repository's transpile/vm tests. No external API or DOM required.
function harness(handler) {
  let values = []; let index = 0; let calls = [];
  class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const code = ts.transpileModule(fs.readFileSync('src/components/reports/WeeklyAnalysis.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  const imports = {
    react: { useState(initial) { const slot = index++; if (!(slot in values)) values[slot] = initial; return [values[slot], value => { values[slot] = value; }]; } },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/lib/api/client': { ApiError, apiRequest: async (...args) => { calls.push(args); return handler(...args); } },
    '@/lib/firebase/client': { getFirebaseAuth: () => ({ currentUser: { uid: 'demo' } }) },
  };
  vm.runInNewContext(code, { exports, require: key => imports[key], AbortSignal, Error });
  let tree;
  function render(props = {}) { index = 0; tree = exports.default({ weekStart: '2026-01-05', timeZone: 'UTC', ...props }); return renderToStaticMarkup(tree); }
  return { render, ApiError, calls, click: () => tree.props.children.find(child => child?.type === 'button').props.onClick(), reset: () => { values = []; } };
}
const result = { analysis: { summary: 'Según los registros disponibles, semana parcial.', trends: ['Hay registros de entrenamiento.'], reviewPoints: ['Faltan mediciones de peso.'] }, cached: false, fingerprint: 'hash', generatedAt: '2026-01-12' };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('Initial state makes no request; click sends selected week, renders loading and all three result blocks', async () => {
  let release;
  const h = harness(() => new Promise(resolve => { release = resolve; }));
  const initial = h.render();
  assert.match(initial, /Análisis de la semana con IA/); assert.match(initial, /Analizar semana con IA/); assert.equal(h.calls.length, 0);
  h.click(); const loading = h.render(); assert.match(loading, /Analizando los registros de la semana…/); assert.match(loading, /disabled/);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0][0], 'reports/weekly-analysis');
  assert.deepEqual(JSON.parse(h.calls[0][1].body), { weekStart: '2026-01-05', timeZone: 'UTC' });
  release(result); await settle();
  const rendered = h.render();
  for (const text of ['Resumen', 'Tendencias', 'Aspectos a revisar', result.analysis.summary, ...result.analysis.trends, ...result.analysis.reviewPoints]) assert.ok(rendered.includes(text));
  assert.match(rendered, /No constituye una recomendación médica, nutricional ni profesional/);
  assert.doesNotMatch(rendered, /Analizando los registros/);
});
test('Errors and quota exhaustion are visible without hiding the independent report', async () => {
  for (const quota of [false, true]) {
    const h = harness(async () => { throw quota ? new h.ApiError(429, 'quota') : new Error('Proveedor no disponible'); });
    h.render(); h.click(); await settle();
    const markup = h.render(); assert.match(markup, /role="alert"/);
    assert.match(markup, quota ? /Se alcanzó el límite disponible/ : /Proveedor no disponible/);
    assert.match(markup, /Analizar semana con IA/);
    // Mount the actual report page below to verify its metrics survive an AI error.
  }
});
test('Cached result, refresh disabling and remount after changed report never trigger automatic analysis', async () => {
  const h = harness(async () => ({ ...result, cached: true }));
  h.render({ disabled: true }); h.click(); assert.equal(h.calls.length, 0);
  h.render(); h.click(); await settle(); assert.match(h.render(), /Análisis guardado/);
  h.reset(); assert.doesNotMatch(h.render({ weekStart: '2026-01-12' }), /Según los registros disponibles/); assert.equal(h.calls.length, 1);
});
test('Actual ReportsPage preserves deterministic metrics alongside the separate AI section', () => {
  const nutrient = { value: null, average: null, daysWithData: 0, missingItems: 0 };
  const period = { days: [], weight: { averageKg: null, changeKg: null, count: 0, measurements: [] },
    food: { daysWithRecords: 0, estimatedItems: 0, items: 0, nutrients: Object.fromEntries(['calories', 'protein', 'fat', 'carbohydrates'].map(key => [key, nutrient])) },
    training: { sessions: { completed: 0, in_progress: 0, abandoned: 0 }, completedSets: 0, reps: 0, recordedLoadSets: 0, externalVolumeKg: null, exercises: [] } };
  const report = { period: { from: '2026-01-05', to: '2026-01-11', through: '2026-01-11', today: '2026-01-12', elapsedDays: 7 },
    current: period, previous: { ...period, from: '2025-12-29', through: '2026-01-04' }, logs: [],
    comparison: { completedSessionsDelta: 0, completedSetsDelta: 0, weightAverageDeltaKg: null } };
  let analysisProps;
  const imports = {
    react: { useEffect() {}, useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: props => React.createElement('a', props, props.children) },
    '@/lib/auth/provider': { useAuth: () => ({ identity: { uid: 'demo' } }) },
    '@/lib/store/hooks': { useDashboardProfile: () => ({ ready: true }), useCachedQuery: () => ({ data: report }) },
    '@/lib/training-sessions': { monday: () => '2026-01-05', localDate: () => '2026-01-05', addDays: (date, offset) => new Date(new Date(date).getTime() + offset * 86400000).toISOString().slice(0, 10), dateLabel: date => date, sessionStatus: {} },
    '@/lib/food': { formatNumber: value => String(value), nutrientKeys: ['calories', 'protein', 'fat', 'carbohydrates'], nutrientLabels: { calories: 'Calorías' }, mealTypes: [] },
    '@/components/ui/DashboardLoading': { default: () => null },
    '@/components/weight/WeightChart': { default: () => null },
    '@/components/reports/WeeklyAnalysis': { default: props => { analysisProps = props; return React.createElement('p', { role: 'alert' }, 'Error de IA simulado'); } },
  };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/app/app/reportes/page.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: key => imports[key], Intl });
  const rendered = renderToStaticMarkup(exports.default());
  for (const text of ['Error de IA simulado', 'Sesiones completadas', 'Series realizadas', 'Alimentación registrada', 'Peso corporal', 'Resumen semanal']) assert.ok(rendered.includes(text), text);
  assert.equal(analysisProps.weekStart, '2026-01-05');
});
