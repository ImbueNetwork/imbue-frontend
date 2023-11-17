'use client';

import { configureStore } from '@reduxjs/toolkit';

import userReducer from '../slices/userSlice';

export const store = configureStore({
  reducer: {
    userState: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
