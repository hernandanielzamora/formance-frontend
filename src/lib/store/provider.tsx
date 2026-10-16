'use client';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useAuth } from '../auth/provider';
import { makeStore } from './store';
import { appApi } from './api';

function AccountStore({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return () => {
      unsubscribe();
      for (const request of [...store.dispatch(appApi.util.getRunningQueriesThunk()), ...store.dispatch(appApi.util.getRunningMutationsThunk())]) request.abort();
      store.dispatch(appApi.util.resetApiState());
    };
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, identity } = useAuth();
  // A different account/role gets a fresh store, including when signing out.
  // Keep the last confirmed role during token refresh so navigation stays mounted.
  const [confirmed, setConfirmed] = useState<{ uid: string; role: string } | null>(null);
  if (identity && (confirmed?.uid !== identity.uid || confirmed.role !== identity.role)) setConfirmed({ uid: identity.uid, role: identity.role });
  const role = confirmed?.uid === user?.uid ? confirmed?.role : 'user';
  return <AccountStore key={`${user?.uid || 'anonymous'}:${role}`}>{children}</AccountStore>;
}
