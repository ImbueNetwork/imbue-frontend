/* eslint-disable no-console */
'use client';

import { googleLogout } from '@react-oauth/google';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getCurrentUser, getStreamChat, redirect } from '@/utils';

import { postAPIHeaders } from '@/config';
import { User } from '@/model';

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
      // redirect('auth/sign-in');

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
    localStorage.removeItem('profileView');
    redirect('auth/sign-in');
  } catch (error) {
    console.log(error);
  }
});

export const getStreamClient = createAsyncThunk(
  'users/clientSetup',
  async (user: User) => {
    const client = await getStreamChat();
    if (user && user.id) {
      client?.connectUser(
        {
          id: String(user.id),
          username: user.username,
          name: user.display_name,
        },
        user.getstream_token
      );
      return client;
    }
    return null;
  }
);
