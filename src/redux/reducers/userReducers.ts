/* eslint-disable no-console */
'use client';

import { googleLogout } from '@react-oauth/google';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getCurrentUser, redirect } from '@/utils';

import { postAPIHeaders } from '@/config';

export const fetchUserRedux = createAsyncThunk(
  'user/fetchUserRedux',
  async () => {
    const resp = await getCurrentUser();

    if (resp.id) return resp;
    else {
      await fetch(`/api/auth/logout`, {
        headers: postAPIHeaders,
        method: 'get',
      });
      googleLogout();
      redirect('auth/sign-in');

      return {
        status: 'failed',
      };
    }
  }
);

export const logout = createAsyncThunk('users/logout', async () => {
  try {
    await fetch(`/api/auth/logout`, {
      headers: postAPIHeaders,
      method: 'get',
    });
    googleLogout();
    redirect('auth/sign-in');
  } catch (error) {
    console.log(error);
  }
});
