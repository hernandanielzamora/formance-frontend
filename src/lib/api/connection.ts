export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api').replace(/\/$/, '');
export type ConnectionState = 'idle' | 'connecting' | 'ready' | 'unavailable';
let state: ConnectionState = 'idle';
let checkedAt = 0;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();
export const getConnectionState = () => state;
export function subscribeConnection(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function update(next: ConnectionState) { state = next; listeners.forEach(listener => listener()); }
export function invalidateConnection() { checkedAt = 0; }

// Only the public health check is retried. Never replay a write or an AI request.
export function ensureBackendReady(): Promise<void> {
  if (pending) return pending;
  if (checkedAt && Date.now() - checkedAt < 30_000) return Promise.resolve();
  update('connecting');
  pending = (async () => {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, { cache: 'no-store', signal: AbortSignal.timeout(Math.min(10_000, deadline - Date.now())) });
        const body = response.ok ? await response.json() : null;
        // Render's loading page can be HTML with a successful HTTP status.
        if (body?.service === 'formance-backend' && body.status === 'ok') {
          checkedAt = Date.now(); update('ready'); return;
        }
      } catch { /* A waking service may time out or return a gateway/network error. */ }
      const remaining = deadline - Date.now();
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, Math.min(2000, remaining)));
    }
    update('unavailable');
    throw new Error('No pudimos conectar con el servidor. Revisá tu conexión y volvé a intentar.');
  })().finally(() => { pending = null; });
  return pending;
}

// Cancel one caller without cancelling the shared wake-up for other screens.
export function waitForBackend(signal?: AbortSignal | null): Promise<void> {
  signal?.throwIfAborted();
  const readiness = ensureBackendReady();
  if (!signal) return readiness;
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    readiness.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}
