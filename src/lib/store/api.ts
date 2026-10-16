import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { apiRequest, ApiError } from '../api/client';
import { getFirebaseAuth } from '../firebase/client';

export type Scope = { uid: string; role: string };
type Request = Scope & { path: string; method?: string; body?: string };
export type RequestError = { status: number; message: string };
type Tag = 'Profile' | 'Catalog' | 'Routines' | 'Calendar' | 'Diary' | 'Capabilities' | 'Weight' | 'Reports';

export function readTags(path: string): Tag[] {
  const route = path.split('?')[0];
  return ({ profile: ['Profile'], 'training/catalog': ['Catalog'], 'training/routines': ['Routines'],
    'training/calendar': ['Calendar'], 'food/diary': ['Diary'], 'food/capabilities': ['Capabilities'],
    weight: ['Weight'], 'reports/weekly': ['Reports'] } as Record<string, Tag[]>)[route] || [];
}

export function writeTags(path: string): Tag[] {
  if (path === 'profile/onboarding') return ['Profile', 'Catalog', 'Diary', 'Weight', 'Reports'];
  if (path.startsWith('training/sessions')) return ['Calendar', 'Reports'];
  if (path === 'training/active-routine') return ['Routines', 'Calendar'];
  if (path.startsWith('training/')) return ['Catalog', 'Routines', 'Calendar'];
  if (path.startsWith('food/meals')) return ['Diary', 'Reports'];
  if (path.startsWith('weight/measurements')) return ['Weight', 'Reports'];
  return [];
}

export function freshness(path: string) {
  return ['profile', 'training/catalog', 'training/routines', 'food/capabilities'].includes(path) ? 300 : 60;
}

const baseQuery: BaseQueryFn<Request, unknown, RequestError> = async (request, api) => {
  try {
    const auth = getFirebaseAuth();
    if (auth.currentUser?.uid !== request.uid) throw new ApiError(401, 'La sesión cambió. Volvé a ingresar.');
    const data = await apiRequest(request.path, { method: request.method, body: request.body, signal: api.signal }, auth);
    if (auth.currentUser?.uid !== request.uid) throw new ApiError(401, 'La sesión cambió.');
    return { data };
  } catch (error) {
    return { error: { status: error instanceof ApiError ? error.status : 500, message: error instanceof Error ? error.message : 'No pudimos completar la solicitud.' } };
  }
};

export const appApi = createApi({
  reducerPath: 'appApi', baseQuery,
  tagTypes: ['Profile', 'Catalog', 'Routines', 'Calendar', 'Diary', 'Capabilities', 'Weight', 'Reports'],
  keepUnusedDataFor: 600,
  refetchOnReconnect: true,
  endpoints: build => ({
    read: build.query<unknown, Request>({ query: request => request, providesTags: (_data, _error, request) => readTags(request.path) }),
    write: build.mutation<unknown, Request>({
      query: request => request,
      // Also reconcile uncertain writes (e.g. a lost response) without retrying the mutation.
      invalidatesTags: (_data, _error, request) => writeTags(request.path),
    }),
  }),
});
