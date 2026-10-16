import type { Auth } from 'firebase/auth';
import { apiBaseUrl, invalidateConnection, waitForBackend } from './connection';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, auth?: Auth): Promise<T> {
  try { await waitForBackend(options.signal); }
  catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(503, 'No pudimos conectar con el servidor. Revisá tu conexión y volvé a intentar.');
  }
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth?.currentUser) headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/${path.replace(/^\//, '')}`, { ...options, headers, cache: 'no-store', signal: AbortSignal.any([AbortSignal.timeout(options.signal ? 60_000 : 30_000), ...(options.signal ? [options.signal] : [])]) });
  } catch (error) {
    invalidateConnection();
    if (options.signal?.aborted) throw error;
    const reading = ['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase());
    throw new ApiError(503, reading ? 'Se interrumpió la conexión. Volvé a intentar.' : 'Se interrumpió la conexión. Comprobá el historial antes de volver a guardar; la operación podría haberse completado.');
  }
  if (!response.ok) {
    if ([502, 503, 504].includes(response.status)) invalidateConnection();
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.error?.message || `La API respondió con estado ${response.status}.`);
  }
  return response.json() as Promise<T>;
}
