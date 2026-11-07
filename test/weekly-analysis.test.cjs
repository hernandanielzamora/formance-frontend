const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadBalance() {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/lib/weekly-balance.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports });
  return exports;
}
function fixture() {
  const nutrients = Object.fromEntries(['calories', 'protein', 'fat', 'carbohydrates'].map(key => [key, { value: 0, average: 0, daysWithData: 1, missingItems: 0 }]));
  const training = { totalSessions: 1, sessions: { completed: 1, abandoned: 0, in_progress: 0 }, completedSets: 3, setsWithoutRecordedLoad: 0 };
  const food = { meals: 1, daysWithRecords: 1, estimatedItems: 0, nutrients };
  return { period: { elapsedDays: 2, isPartial: true }, current: { training, food, weight: { count: 0, averageKg: null, measurements: [] },
    days: [{ date: '2026-01-05', training, food, weight: null }, { date: '2026-01-06', training: { ...training, totalSessions: 0 }, food: { ...food, nutrients: Object.fromEntries(Object.keys(nutrients).map(key => [key, { value: null }])) }, weight: null }] } };
}
function findButton(node) {
  if (!node) return;
  if (node.type === 'button') return node;
  const children = Array.isArray(node) ? node : node.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) { const found = typeof child === 'object' && findButton(child); if (found) return found; }
}

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
    'next/link': { default: props => React.createElement('a', props, props.children) },
    '@/lib/food': { formatNumber: value => value === null ? 'Sin dato' : String(value) },
    '@/lib/weekly-balance': loadBalance(),
  };
  vm.runInNewContext(code, { exports, require: key => imports[key], AbortSignal, Error });
  let tree;
  function render(props = {}) { index = 0; tree = exports.default({ weekStart: '2026-01-05', timeZone: 'UTC', report: fixture(), ...props }); return renderToStaticMarkup(tree); }
  return { render, ApiError, calls, click: () => findButton(tree)?.props.onClick(), reset: () => { values = []; } };
}
const result = { analysis: { summary: 'Según los registros disponibles, semana parcial.', comparison: 'Se comparan dos días de ambas semanas.',
  insights: { training: 'Se registraron sesiones en dos días.', nutrition: 'El promedio registrado usa días con datos.', weight: 'No hay suficientes mediciones.' },
  trends: ['Hay registros de entrenamiento.'], reviewPoints: ['Faltan mediciones de peso.'], nextWeekFocus: ['Mantener condiciones de medición comparables.'] }, cached: false, fingerprint: 'hash', generatedAt: '2026-01-12' };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('Initial state makes no request; click sends selected week, renders loading and all three result blocks', async () => {
  let release;
  const h = harness(() => new Promise(resolve => { release = resolve; }));
  const initial = h.render();
  assert.match(initial, /Balance semanal/); assert.match(initial, /Consultar detalle/); assert.equal(h.calls.length, 0);
  assert.match(initial, /Para revisar/); assert.match(initial, /Tu próximo paso/); assert.doesNotMatch(initial, /\bIA\b/);
  h.click(); const loading = h.render(); assert.match(loading, /Analizando los registros de la semana…/); assert.match(loading, /disabled/);
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0][0], 'reports/weekly-analysis');
  assert.deepEqual(JSON.parse(h.calls[0][1].body), { weekStart: '2026-01-05', timeZone: 'UTC' });
  release(result); await settle();
  const rendered = h.render();
  for (const text of ['Resumen', 'Patrones observados', 'Aspectos a revisar', result.analysis.summary, ...result.analysis.trends, ...result.analysis.reviewPoints]) assert.ok(rendered.includes(text));
  for (const text of ['Entrenamiento', 'Alimentación', 'Peso y evolución', 'Foco para la próxima semana',
    ...Object.values(result.analysis.insights), ...result.analysis.nextWeekFocus]) assert.ok(rendered.includes(text));
  assert.doesNotMatch(rendered, /Comparación con la semana anterior/);
  assert.match(rendered, /No constituye una recomendación médica, nutricional ni profesional/);
  assert.doesNotMatch(rendered, /Analizando los registros/);
});
test('During staggered deployment a legacy analysis still renders without empty enriched sections', async () => {
  const h = harness(async () => ({ ...result, analysis: { summary: 'Formato anterior.', trends: ['Tendencia anterior.'], reviewPoints: ['Revisión anterior.'] } }));
  h.render(); h.click(); await settle();
  const markup = h.render(); assert.match(markup, /Formato anterior/); assert.match(markup, /Tendencia anterior/);
  assert.doesNotMatch(markup, /<h3>Comparación con la semana anterior/); assert.doesNotMatch(markup, /<h3>Foco para la próxima semana/);
});
test('Errors and quota exhaustion are visible without hiding the independent report', async () => {
  for (const quota of [false, true]) {
    const h = harness(async () => { throw quota ? new h.ApiError(429, 'quota') : new Error('Proveedor no disponible'); });
    h.render(); h.click(); await settle();
    const markup = h.render(); assert.match(markup, /role="alert"/);
    assert.match(markup, quota ? /Se alcanzó el límite disponible/ : /Proveedor no disponible/);
    assert.match(markup, /Consultar detalle/);
    assert.match(markup, /Sesiones completadas por día/);
    // Mount the actual report page below to verify its metrics survive an AI error.
  }
});
test('Cached result, refresh disabling and remount after changed report never trigger automatic analysis', async () => {
  const h = harness(async () => ({ ...result, cached: true }));
  h.render({ disabled: true }); h.click(); assert.equal(h.calls.length, 0);
  h.render(); h.click(); await settle(); assert.match(h.render(), /Detalle guardado/);
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
  assert.equal(analysisProps.report, report);
});

test('Balance prioritizes actionable recorded issues and never turns missing days into failure', () => {
  const report = fixture();
  report.current.training.sessions.abandoned = 2;
  report.current.training.setsWithoutRecordedLoad = 3;
  report.current.food.nutrients.protein.missingItems = 1;
  const { points, next } = loadBalance().weeklyBalance(report);
  assert.equal(points[0].title, '2 sesiones interrumpidas');
  assert.equal(points[1].title, '3 series con datos incompletos');
  assert.equal(points[2].title, '1 nutriente con datos incompletos');
  assert.equal(next.href, '/app/entrenamiento/calendario');
  assert.equal(points.at(-1).tone, 'info');
  const h = harness(async () => result);
  const markup = h.render({ report });
  assert.match(markup, /! Revisar/);
  assert.match(markup, /Otros puntos para revisar/);
  assert.doesNotMatch(markup, /incumpliste|comiste mal|déficit|superávit/);
});

test('Zero, missing and future days remain distinct in charts; empty weeks cannot request detail', () => {
  const h = harness(async () => result);
  const markup = h.render();
  assert.match(markup, /L: 0 kcal registradas; M: sin registro; X: día futuro/);
  assert.match(markup, /Sin dato/);
  const report = fixture();
  report.current.training.totalSessions = 0; report.current.food.meals = 0;
  const empty = h.render({ report });
  assert.match(empty, /Empezá por un registro/);
  assert.doesNotMatch(empty, /Consultar detalle/);
  h.click(); assert.equal(h.calls.length, 0);
});

test('Single weight and inferred dates receive informational states, not negative judgments', () => {
  const report = fixture();
  report.current.weight = { count: 1, averageKg: 80, measurements: [{ dateInferred: false }] };
  let points = loadBalance().weeklyBalance(report).points;
  assert.equal(points[0].title, 'Una sola medición'); assert.equal(points[0].tone, 'info');
  report.current.weight.measurements[0].dateInferred = true;
  points = loadBalance().weeklyBalance(report).points;
  assert.equal(points[0].title, 'Hay fechas de peso aproximadas'); assert.equal(points[0].tone, 'info');
});
