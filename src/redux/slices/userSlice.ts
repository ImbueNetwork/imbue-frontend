'use client';

import { createSlice } from '@reduxjs/toolkit';
import { DefaultGenerics, StreamChat } from 'stream-chat';

import { User } from '@/model';

import {
  fetchUserRedux,
  getStreamClient,
  logout,
} from '../reducers/userReducers';

export const initialState: {
  user: User;
  loading: boolean;
  message: 0;
  client: StreamChat<DefaultGenerics> | null;
  error: any;
} = {
  user: {
    id: 0,
    display_name: '',
    username: '',
    getstream_token: '',
    email: '',
  },
  message: 0,
  loading: true,
  error: {},
  client: null,
};

export const userState = createSlice({
  name: 'userState',
  initialState,
  reducers: {
    setUnreadMessage(state, action) {
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
    builder.addCase(getStreamClient.fulfilled, (state, action) => {
      state.client = action.payload;
    });
  },
});

export const { setUnreadMessage } = userState.actions;

export default userState.reducer;
