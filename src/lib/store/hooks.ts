'use client';
import { useCallback, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/provider';
import { ApiError } from '../api/client';
import type { Profile } from '../profile';
import { appApi, freshness, type RequestError } from './api';

export function useCachedQuery<T>(path: string, enabled = true) {
  const session = useAuth();
  const scope = session.identity;
  const ready = enabled && !session.loading && scope?.emailVerified && session.user?.uid === scope.uid;
  const result = appApi.useReadQuery(ready ? { uid: scope.uid, role: scope.role, path } : skipToken, {
    refetchOnMountOrArgChange: freshness(path),
  });
  useEffect(() => {
    const refreshIfStale = () => {
      if (ready && !result.isUninitialized && !result.isFetching && document.visibilityState === 'visible'
        && Date.now() - (result.fulfilledTimeStamp || 0) >= freshness(path) * 1000) void result.refetch();
    };
    window.addEventListener('focus', refreshIfStale);
    document.addEventListener('visibilitychange', refreshIfStale);
    return () => { window.removeEventListener('focus', refreshIfStale); document.removeEventListener('visibilitychange', refreshIfStale); };
  }, [ready, path, result.isUninitialized, result.isFetching, result.fulfilledTimeStamp, result.refetch]);
  return { ...result, data: ready ? result.currentData as T | undefined : undefined,
    error: ready && result.error ? (result.error as RequestError).message || 'No pudimos cargar los datos.' : '',
    refresh: () => { if (ready && !result.isUninitialized) void result.refetch(); },
  };
}

export function useDashboardProfile() {
  const session = useAuth(); const router = useRouter();
  const query = useCachedQuery<{ profile: Profile | null }>('profile');
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { router.replace('/login'); return; }
    if (!session.identity) return;
    if (!session.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    if (query.data && !query.data.profile?.onboardingCompleted) router.replace('/onboarding');
  }, [session.loading, session.user, session.identity, query.data, router]);
  return { ...query, ready: Boolean(query.data?.profile?.onboardingCompleted) };
}

export function useApiMutationRequest() {
  const { identity } = useAuth();
  const [write] = appApi.useWriteMutation();
  return useCallback(async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    if (!identity) throw new ApiError(401, 'Volvé a iniciar sesión.');
    try {
      return await write({ uid: identity.uid, role: identity.role, path, method: options.method || 'POST', body: options.body as string | undefined }).unwrap() as T;
    } catch (error) {
      const failure = error as RequestError;
      throw new ApiError(failure.status || 500, failure.message || 'No pudimos guardar los cambios.');
    }
  }, [identity, write]);
}
