const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness(fetcher) {
  let now = 100;
  const Clock = class extends Date { static now() { return now; } };
  const load = (file, imports = {}) => {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(`src/lib/api/${file}.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, { exports, require: key => imports[key], process: { env: {} }, Date: Clock, Headers, AbortSignal, fetch: fetcher,
      setTimeout: (fn, ms) => { now += ms; queueMicrotask(fn); }, console });
    return exports;
  };
  const connection = load('connection');
  return { ...connection, client: load('client', { './connection': connection }), advance: ms => { now += ms; } };
}
const healthy = () => Response.json({ service: 'formance-backend', status: 'ok' });

test('Cold start: shared check retries gateway errors and HTML, then releases concurrent requests', async () => {
  let health = 0; let reads = 0; let tokens = 0;
  const h = harness(async url => {
    if (url.endsWith('/health')) {
      health++;
      if (health === 1) throw new TypeError('network');
      if (health === 2) return new Response('Starting', { status: 503 });
      if (health === 3) return new Response('<html>Loading</html>');
      return healthy();
    }
    assert.equal(h.getConnectionState(), 'ready'); reads++; return Response.json({ ok: true });
  });
  const auth = { currentUser: { getIdToken: async () => { tokens++; return 'test'; } } };
  await Promise.all([h.client.apiRequest('profile', {}, auth), h.client.apiRequest('reports/weekly', {}, auth)]);
  assert.equal(health, 4); assert.equal(reads, 2); assert.equal(tokens, 2);
  await h.ensureBackendReady(); assert.equal(health, 4);
  h.advance(31_000); await h.ensureBackendReady(); assert.equal(health, 5);
});

test('Unavailable service stops after 90 seconds, sends no writes and can recover manually', async () => {
  let available = false; let writes = 0; let attempts = 0;
  const h = harness(async url => {
    if (url.endsWith('/health')) { attempts++; return available ? healthy() : new Response('', { status: 503 }); }
    writes++; return Response.json({});
  });
  await assert.rejects(h.client.apiRequest('weight/measurements', { method: 'POST', body: '{}' }), /No pudimos conectar/);
  assert.equal(h.getConnectionState(), 'unavailable'); assert.equal(writes, 0);
  assert.equal(attempts, 45);
  available = true; await h.ensureBackendReady(); assert.equal(h.getConnectionState(), 'ready');
});

test('Cancellation stops one caller while other callers continue sharing the wake-up', async () => {
  let release;
  const h = harness(() => new Promise(resolve => { release = resolve; }));
  const controller = new AbortController();
  const cancelled = h.waitForBackend(controller.signal);
  const other = h.waitForBackend();
  controller.abort(); await assert.rejects(cancelled, error => error.name === 'AbortError');
  release(healthy()); await other; assert.equal(h.getConnectionState(), 'ready');
});

test('Lost write response is never replayed; business errors such as 401 are preserved', async () => {
  let writes = 0; let unauthorized = false;
  const h = harness(async url => {
    if (url.endsWith('/health')) return healthy();
    if (unauthorized) return Response.json({ error: { message: 'Sesión vencida' } }, { status: 401 });
    writes++; throw new TypeError('Connection lost after save');
  });
  await assert.rejects(h.client.apiRequest('food/analyze', { method: 'POST', body: '{}' }), /Comprobá el historial/);
  assert.equal(writes, 1);
  unauthorized = true;
  await assert.rejects(h.client.apiRequest('auth/me'), error => error.status === 401 && error.message === 'Sesión vencida');
  assert.equal(writes, 1);
});
