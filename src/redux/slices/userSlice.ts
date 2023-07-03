'use client';

import { createSlice } from '@reduxjs/toolkit';

import { User } from '@/model';

import { fetchUser, logout } from '../reducers/userReducers';

export const initialState: { user: User; loading: boolean; error: any } = {
  user: {
    id: 0,
    display_name: '',
    username: '',
    getstream_token: '',
  },
  loading: true,
  error: {},
};

export const userState = createSlice({
  name: 'userState',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state = initialState;
      return state;
    });

    builder.addCase(fetchUser.fulfilled, (state, action) => {
      if (action?.payload?.status === 'failed') {
        state.error = action?.payload?.error;
      }
      state.user = { ...action.payload };
      state.loading = false;
    });

    builder.addCase(fetchUser.pending, (state) => {
      state.loading = true;
    });
  },
});

export default userState.reducer;
