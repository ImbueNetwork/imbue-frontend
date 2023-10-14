'use client';

import { createSlice } from '@reduxjs/toolkit';

import { User } from '@/model';

import { fetchUserRedux, logout } from '../reducers/userReducers';

export const initialState: {
  user: User;
  loading: boolean;
  message: 0;
  error: any;
} = {
  user: {
    id: 0,
    display_name: '',
    username: '',
    getstream_token: '',
  },
  message: 0,
  loading: true,
  error: {},
};

export const userState = createSlice({
  name: 'userState',
  initialState,
  reducers: {
    setUnreadMessage(state, action) {
      console.log(action.payload);
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state = initialState;
      return state;
    });

    builder.addCase(fetchUserRedux.fulfilled, (state, action) => {
      if (action?.payload?.status === 'failed') {
        state.error = action?.payload?.error;
      }
      state.user = { ...action.payload };
      state.loading = false;
    });

    builder.addCase(fetchUserRedux.pending, (state) => {
      state.loading = true;
    });
  },
});

export const { setUnreadMessage } = userState.actions;

export default userState.reducer;
