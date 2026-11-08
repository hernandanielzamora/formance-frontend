const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const transpile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const link = { default: props => React.createElement('a', props, props.children) };
function load(file, imports) { const exports = {}; vm.runInNewContext(transpile(file), { exports, require: key => imports[key], AbortSignal, Error, Intl, requestAnimationFrame: fn => fn(), document: {} }); return exports.default; }
function findButton(node) {
  if (!node) return;
  if (node.type === 'button') return node;
  const children = Array.isArray(node) ? node : node.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) { const found = typeof child === 'object' && findButton(child); if (found) return found; }
}
// Ejecuta el componente real con un driver mínimo de hooks, sin DOM ni API externa.
function analysisHarness(handler) {
  let values = []; let index = 0; const calls = [];
  class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const Component = load('src/components/reports/WeeklyAnalysis.tsx', {
    react: { useState(initial) { const slot = index++; if (!(slot in values)) values[slot] = initial; return [values[slot], value => { values[slot] = value; }]; } },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/lib/api/client': { ApiError, apiRequest: async (...args) => { calls.push(args); return handler(...args); } },
    '@/lib/firebase/client': { getFirebaseAuth: () => ({ currentUser: { uid: 'demo' } }) },
  });
  let tree;
  return { ApiError, calls, render(props = {}) { index = 0; tree = Component({ weekStart: '2026-01-05', timeZone: 'UTC', hasRecords: true, ...props }); return renderToStaticMarkup(tree); },
    click: () => findButton(tree)?.props.onClick(), reset: () => { values = []; } };
}
const analysis = { headline: 'Muy buena semana.', wins: ['Entrenaste 4 de 4 días.'], improvements: ['El sábado comiste 3.400 kcal.'], focus: 'Planificá el sábado.', trend: 'Tercera semana completa seguida.',
  detail: { training: 'Subiste carga en sentadilla.', nutrition: 'En objetivo 5 de 7 días.', weight: 'Bajó 0,4 kg.' } };
const result = { analysis, cached: false, fingerprint: 'hash', generatedAt: '2026-01-12' };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('El análisis escrito solo se pide al pulsar y muestra titular, listas, foco y detalle', async () => {
  let release; const h = analysisHarness(() => new Promise(resolve => { release = resolve; }));
  const initial = h.render(); assert.match(initial, /Generar análisis/); assert.match(initial, /notas de entrenamientos y comidas de las últimas 4 semanas/); assert.equal(h.calls.length, 0); assert.doesNotMatch(initial, /\bIA\b/);
  h.click(); assert.match(h.render(), /Preparando análisis…/);
  assert.equal(h.calls[0][0], 'reports/weekly-analysis'); assert.deepEqual(JSON.parse(h.calls[0][1].body), { weekStart: '2026-01-05', timeZone: 'UTC' });
  release(result); await settle();
  const rendered = h.render();
  for (const text of [analysis.headline, analysis.trend, 'Últimas 4 semanas', ...analysis.wins, ...analysis.improvements, analysis.focus, ...Object.values(analysis.detail), 'Entrenamiento', 'Alimentación', 'Peso']) assert.ok(rendered.includes(text), text);
  assert.doesNotMatch(rendered, /Generar análisis/);
});
test('Errores y cupo agotado se informan sin ocultar el botón; deshabilitado o sin registros no consulta', async () => {
  for (const quota of [false, true]) {
    const h = analysisHarness(async () => { throw quota ? new h.ApiError(429, 'quota') : new Error('Proveedor no disponible'); });
    h.render(); h.click(); await settle();
    const markup = h.render(); assert.match(markup, /role="alert"/); assert.match(markup, quota ? /Llegaste al límite/ : /Proveedor no disponible/); assert.match(markup, /Generar análisis/);
  }
  const h = analysisHarness(async () => ({ ...result, cached: true }));
  h.render({ disabled: true }); h.click(); h.render({ hasRecords: false }); h.click(); assert.equal(h.calls.length, 0);
  h.render(); h.click(); await settle(); assert.match(h.render(), /Análisis guardado/);
  h.reset(); assert.doesNotMatch(h.render(), /Muy buena semana/); assert.equal(h.calls.length, 1);
});

const glance = {
  version: 1, goal: 'recomposition', targets: { calories: 2500, protein: 160 }, routinePlanned: true,
  headline: { tone: 'good', title: 'Muy buena semana', text: 'Cumpliste tu rutina y subiste cargas. Para ajustar: las calorías del fin de semana.' },
  training: { status: 'good', planned: 4, plannedWeek: 4, completed: 4, completedPlanned: 4, abandoned: 0, missed: [], completedSets: 50, setsDelta: 0, previousCompleted: 4,
    records: [{ name: 'Sentadilla con barra', maxLoadKg: 90, deltaKg: 2.5 }], days: ['done', 'done', 'rest', 'missed', 'partial', 'today', 'future'].map((state, i) => ({ date: i < 6 ? `2026-01-1${2 + i}` : null, state, planned: true })) },
  nutrition: { status: 'ok', daysLogged: 6, elapsed: 6, avgKcal: 2650, kcalTarget: 2500, kcalPct: .06, onTargetDays: 4, avgProtein: 150, proteinTarget: 160, proteinDays: 4, weekendDelta: .2, peak: null, previousAvgKcal: 2600,
    days: ['on', 'over', 'under', 'missing', 'on', 'on', 'future'].map((state, i) => ({ date: `2026-01-1${2 + i}`, state, kcal: state === 'missing' || state === 'future' ? null : 2500, protein: 150 })) },
  weight: { status: 'attention', count: 2, avgKg: 80, previousAvgKg: 79.5, deltaKg: .5, aligned: false, points: [{ date: '2026-01-12', kg: 80 }, { date: '2026-01-14', kg: 80 }] },
  wins: [{ area: 'training', text: 'Entrenaste 4 de 4 días.' }], improvements: [{ area: 'weight', text: 'Tu peso subió 0,5 kg.', action: 'Mirá las calorías.', href: '/app/peso' }],
  focus: { area: 'weight', text: 'Mirá las calorías.', href: '/app/peso' },
};
const Glance = () => load('src/components/reports/WeeklyGlance.tsx', { 'react/jsx-runtime': require('react/jsx-runtime'), 'next/link': link, '@/lib/training-sessions': { dateLabel: date => date } });

test('La lectura muestra titular, estados por área, días distinguibles, logros, mejoras y foco', () => {
  const markup = renderToStaticMarkup(Glance()({ glance, partial: true }));
  for (const text of ['TU SEMANA HASTA HOY', 'Muy buena semana', 'Lo que hiciste bien', 'Dónde mejorar', 'Entrenaste 4 de 4 días.', 'Tu peso subió 0,5 kg.', 'Mirá las calorías.', 'FOCO PARA LO QUE QUEDA',
    'Sentadilla con barra', '+2,5', 'is-good', 'is-attention', 'En camino', 'objetivo 2.500', '+6 %', 'proteína 150/160 g', 'planificado y sin hacer', 'sesión incompleta', 'planificado para hoy', 'por venir', 'sin registro']) assert.ok(markup.includes(text), text);
  assert.match(markup, /href="\/app\/peso"/);
  assert.doesNotMatch(markup, /incumpliste|comiste mal|déficit|superávit/);
});
test('Sin registros la lectura invita a registrar y no muestra tarjetas vacías', () => {
  const markup = renderToStaticMarkup(Glance()({ glance: { ...glance, headline: { tone: 'empty', title: 'Todavía no hay registros esta semana', text: 'Registrá algo.' }, wins: [], improvements: [], focus: null }, partial: false }));
  assert.match(markup, /Registrar entrenamiento/); assert.doesNotMatch(markup, /glance-card/);
});

test('ReportsPage muestra la lectura primero y deja el detalle y el análisis escrito plegados', () => {
  const nutrient = { value: null, average: null, daysWithData: 0, missingItems: 0 };
  const period = { days: [], weight: { averageKg: null, changeKg: null, count: 0, measurements: [] },
    food: { daysWithRecords: 0, estimatedItems: 0, items: 0, meals: 0, nutrients: Object.fromEntries(['calories', 'protein', 'fat', 'carbohydrates'].map(key => [key, nutrient])) },
    training: { totalSessions: 0, sessions: { completed: 0, in_progress: 0, abandoned: 0 }, completedSets: 0, reps: 0, recordedLoadSets: 0, externalVolumeKg: null, exercises: [] } };
  const report = { glance, period: { from: '2026-01-05', to: '2026-01-11', through: '2026-01-11', today: '2026-01-12', elapsedDays: 7, isPartial: false },
    current: period, previous: { ...period, from: '2025-12-29', through: '2026-01-04' }, logs: [], comparison: { completedSessionsDelta: 0, completedSetsDelta: 0, weightAverageDeltaKg: null, exercises: [] } };
  let analysisProps; let glanceProps;
  const Page = load('src/app/app/reportes/page.tsx', {
    react: { useEffect() {}, useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}] },
    'react/jsx-runtime': require('react/jsx-runtime'), 'next/link': link,
    '@/lib/auth/provider': { useAuth: () => ({ identity: { uid: 'demo' } }) },
    '@/lib/store/hooks': { useDashboardProfile: () => ({ ready: true }), useCachedQuery: () => ({ data: report }) },
    '@/lib/training-sessions': { monday: () => '2026-01-05', localDate: () => '2026-01-05', addDays: (date, offset) => new Date(new Date(date).getTime() + offset * 86400000).toISOString().slice(0, 10), dateLabel: date => date, sessionStatus: {} },
    '@/lib/food': { formatNumber: value => String(value), nutrientKeys: ['calories', 'protein', 'fat', 'carbohydrates'], nutrientLabels: { calories: 'Calorías' }, mealTypes: [] },
    '@/components/ui/DashboardLoading': { default: () => null }, '@/components/weight/WeightChart': { default: () => null },
    '@/components/reports/WeeklyAnalysis': { default: props => { analysisProps = props; return React.createElement('p', null, 'Análisis simulado'); } },
    '@/components/reports/WeeklyGlance': { default: props => { glanceProps = props; return React.createElement('p', null, 'Lectura simulada'); } },
  });
  const rendered = renderToStaticMarkup(Page());
  assert.ok(rendered.indexOf('Lectura simulada') < rendered.indexOf('Más detalle'));
  for (const text of ['Tu semana', 'Análisis escrito', 'Entrenamiento', 'Alimentación', 'Peso', 'Día por día', 'Historial de registros']) assert.ok(rendered.includes(text), text);
  assert.doesNotMatch(rendered, /<details[^>]* open/);
  assert.equal(glanceProps.glance, glance); assert.equal(analysisProps.weekStart, '2026-01-05'); assert.equal(analysisProps.hasRecords, false);
});
