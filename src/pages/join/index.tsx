import styled from '@emotion/styled';
import TextField from '@mui/material/TextField';
import bcrypt from 'bcryptjs';
import React from 'react';
import { useState } from 'react';

import * as utils from '@/utils';

import { postAPIHeaders } from '@/config';

const CssTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#aaa',
  },
  '& label.Mui-error': {
    color: '#aaa',
  },
  '& .MuiInputLabel-root': {
    color: '#aaa',
  },
  '& div.Mui-error': {
    borderRadius: 10,
    border: 2,
  },
  '& div.MuiOutlinedInput-root': {
    backgroundColor: '#ebeae21c',
  },
  '& p.MuiFormHelperText-root': {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
  },
  '& .MuiInputBase-formControl': {
    '& input': {
      color: 'white',
    },
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#b2ff0b',
      borderRadius: 10,
    },
  },
});

const Join = (): JSX.Element => {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matchPassword, setMatchPassword] = useState('');
  const [error, setError] = useState('');

  const salt = bcrypt.genSaltSync(10);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const body = {
      username: user,
      email: email,
      password: hashedPassword,
    };

    const resp = await fetch(`/api/auth/register`, {
      headers: postAPIHeaders,
      method: 'post',
      body: JSON.stringify(body),
    });

    if (resp.ok) {
      await utils.redirectBack();
    } else {
      const error = await resp.json();
      setError(error);
    }
  };

  return (
    <form
      id='contribution-submission-form'
      name='contribution-submission-form'
      method='get'
      onSubmit={handleSubmit}
    >
      <div id='registration-form' className='registration-container'>
        <div className='flex flex-col gap-[34px] w-[75%] justify-between pb-[16px] mx-[auto] mt-12'>
          <div className='flex flex-wrap flex-row justify-center'>
            <h1>Sign up</h1>
          </div>

          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              value={user}
              onChange={(e: any) => setUser(e.target.value)}
              id='username'
              type='text'
              label='Username'
              className='mdc-text-field !rounded-[10px] !w-[70%]'
              required
            />
          </div>

          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              type='email'
              label='Email'
              onChange={(e: any) => setEmail(e.target.value)}
              className='mdc-text-field  !rounded-[10px] !w-[70%]'
              required
            />
          </div>
          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              label='Password'
              helperText='Min 8 chars, at least one uppercase, lowercase, number and one special character'
              onChange={(e: any) => setPassword(e.target.value)}
              type='password'
              className='mdc-text-field !rounded-[10px] !w-[70%]'
              required
            />
          </div>

          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              label='Confirm Password'
              error={matchPassword.length > 0 && password != matchPassword}
              onChange={(e: any) => setMatchPassword(e.target.value)}
              helperText={
                password != matchPassword ? 'Please match password' : ''
              }
              type='password'
              className='mdc-text-field  !rounded-[10px] !w-[70%]'
              required
            />
          </div>
          <div className='flex flex-wrap flex-row justify-center'>
            <span className={!error ? 'hide' : 'error'}>{error}</span>
          </div>
          <div className='flex flex-wrap flex-row justify-center'>
            <button
              type='submit'
              disabled={password != matchPassword}
              className='primary-btn in-dark confirm w-[70%] !text-center'
              id='create-account'
            >
              Create my account
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Join;
