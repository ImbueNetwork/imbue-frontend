'use client';

import { googleLogout } from '@react-oauth/google';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getCurrentUser, redirect } from '@/utils';

import { postAPIHeaders } from '@/config';

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
  try {
    const resp = await getCurrentUser();
    return resp;
  } catch (error) {
    return {
      status: 'failed',
      error,
    };
  }
});

export const logout = createAsyncThunk('users/logout', async () => {
  try {
    await fetch(`/api/auth/logout`, {
      headers: postAPIHeaders,
      method: 'get',
    });
    googleLogout();
    redirect('');
  } catch (error) {
    console.log(error);
  }
});
