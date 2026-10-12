import type { Auth } from 'firebase/auth';

const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api').replace(/\/$/, '');

export async function apiRequest<T>(path: string, options: RequestInit = {}, auth?: Auth): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (auth?.currentUser) headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  const response = await fetch(`${baseUrl}/${path.replace(/^\//, '')}`, { ...options, headers, cache: 'no-store', signal: options.signal || AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`La API respondió con estado ${response.status}.`);
  return response.json() as Promise<T>;
}
