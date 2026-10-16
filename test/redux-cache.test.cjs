const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { configureStore } = require('@reduxjs/toolkit');

function harness(handler) {
  const auth = { currentUser: { uid: 'user' } };
  class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/lib/store/api.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const imports = {
    '@reduxjs/toolkit/query/react': require('@reduxjs/toolkit/query/react'),
    '../api/client': { apiRequest: handler, ApiError },
    '../firebase/client': { getFirebaseAuth: () => auth },
  };
  vm.runInNewContext(code, { exports, require: key => imports[key] });
  const { appApi: api } = exports;
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: get => get().concat(api.middleware) });
  const scope = { uid: 'user', role: 'user' };
  return { api, store, scope, ApiError, ...exports, setUser: uid => { auth.currentUser = { uid }; },
    read: (path, options) => store.dispatch(api.endpoints.read.initiate({ ...scope, path }, options)),
    write: (path, method = 'POST') => store.dispatch(api.endpoints.write.initiate({ ...scope, path, method, body: '{}' })),
    close: () => store.dispatch(api.util.resetApiState()),
  };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 30));

test('Shared queries deduplicate concurrent requests and reuse responses after navigation', async () => {
  let reads = 0;
  const h = harness(async () => { reads++; return { profile: { name: 'Test' } }; });
  try {
    const first = h.read('profile'); const second = h.read('profile');
    await Promise.all([first, second]); assert.equal(reads, 1);
    first.unsubscribe(); second.unsubscribe();
    const back = h.read('profile'); await back;
    assert.equal(reads, 1); assert.equal(back.arg.path, 'profile'); back.unsubscribe();
  } finally { h.close(); }
});

test('Dates, time zones, accounts and roles have separate cache entries; reset clears private data', async () => {
  let reads = 0; const h = harness(async path => ({ path, request: ++reads }));
  try {
    const a = h.read('food/diary?date=2026-10-15&timeZone=UTC'); await a;
    await h.read('food/diary?date=2026-10-16&timeZone=UTC');
    await h.read('food/diary?date=2026-10-15&timeZone=America%2FBuenos_Aires');
    await h.store.dispatch(h.api.endpoints.read.initiate({ ...h.scope, role: 'admin', path: a.arg.path }));
    h.setUser('other');
    await h.store.dispatch(h.api.endpoints.read.initiate({ uid: 'other', role: 'user', path: a.arg.path }));
    assert.equal(reads, 5);
    h.close(); assert.equal(Object.keys(h.store.getState().appApi.queries).length, 0);
    assert.equal(Object.keys(h.store.getState().appApi.mutations).length, 0);
  } finally { h.close(); }
});

test('Food, training, weight and routine mutations refresh related views without reloading profile/catalog unnecessarily', async () => {
  const reads = new Map();
  const h = harness(async (path, options) => { if (!options.method) reads.set(path, (reads.get(path) || 0) + 1); return {}; });
  try {
    for (const path of ['profile', 'training/catalog', 'training/routines', 'training/calendar', 'food/diary', 'weight', 'reports/weekly']) await h.read(path);
    await h.write('food/meals'); await settle();
    assert.equal(reads.get('food/diary'), 2); assert.equal(reads.get('reports/weekly'), 2);
    assert.equal(reads.get('profile'), 1); assert.equal(reads.get('training/catalog'), 1);
    await h.write('training/sessions/session', 'PUT'); await settle();
    assert.equal(reads.get('training/calendar'), 2); assert.equal(reads.get('reports/weekly'), 3);
    await h.write('weight/measurements'); await settle();
    assert.equal(reads.get('weight'), 2); assert.equal(reads.get('reports/weekly'), 4);
    await h.write('training/active-routine', 'PUT'); await settle();
    assert.equal(reads.get('training/routines'), 2); assert.equal(reads.get('training/calendar'), 3);
    assert.equal(reads.get('training/catalog'), 1);
    await h.write('profile/onboarding', 'PUT'); await settle();
    assert.equal(reads.get('profile'), 2); assert.equal(reads.get('training/catalog'), 2);
  } finally { h.close(); }
});

test('Session changes during a request discard results and failed mutations are not retried', async () => {
  let release; let calls = 0;
  const h = harness(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  try {
    const pending = h.read('profile'); h.setUser('other'); release({ private: true });
    const result = await pending;
    assert.equal(result.error.status, 401); assert.equal(result.data, undefined);
    const rejected = await h.write('food/meals');
    assert.equal(rejected.error.status, 401); assert.equal(calls, 1);
  } finally { h.close(); }
});

test('Version conflicts remain 409 and uncertain writes reconcile cached views once', async () => {
  let reads = 0; let writes = 0;
  const h = harness(async (_path, options) => {
    if (!options.method) { reads++; return {}; }
    writes++; throw new h.ApiError(409, 'Changed');
  });
  try {
    await h.read('food/diary');
    const result = await h.write('food/meals'); await settle();
    assert.equal(result.error.status, 409); assert.equal(writes, 1); assert.equal(reads, 2);
  } finally { h.close(); }
});
