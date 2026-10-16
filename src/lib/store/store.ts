import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './api';

export const makeStore = () => configureStore({
  reducer: { [appApi.reducerPath]: appApi.reducer },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(appApi.middleware),
});
export type AppStore = ReturnType<typeof makeStore>;
