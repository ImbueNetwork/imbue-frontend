'use client';

import { createSlice } from '@reduxjs/toolkit';

import { User } from '@/model';

import { login, logout } from '../reducers/userReducers';

const initialState: { value: User } = {
  value: {
    id: 0,
    display_name: '',
    username: '',
    getstream_token: '',
  },
};

export const user = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state = initialState;
      return state;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.value = { ...action.payload };
    });
  },
});

export default user.reducer;
