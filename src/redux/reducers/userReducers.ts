'use client'

import { googleLogout } from '@react-oauth/google';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getCurrentUser, redirect } from '@/utils';

import { postAPIHeaders } from '@/config';


export const login = createAsyncThunk('user/login',async () => {
    const resp = await getCurrentUser()
    return resp
})

export const logout = createAsyncThunk('users/logout', async () => {
  await fetch(`/api/auth/logout`, {
    headers: postAPIHeaders,
    method: 'get',
  });
  googleLogout();
  redirect('');
});
