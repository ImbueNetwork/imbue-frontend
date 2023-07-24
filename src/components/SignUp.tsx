/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { CircularProgress } from '@mui/material';
import bcrypt from 'bcryptjs';
import React, { useEffect } from 'react';
import { useState } from 'react';
import PasswordStrengthBar from 'react-password-strength-bar';

import * as utils from '@/utils';

import { postAPIHeaders } from '@/config';

type SignUpFormProps = {
  setFormContent: (value: string) => void;
  redirectUrl: string;
};

const SignUp = ({ setFormContent, redirectUrl }: SignUpFormProps) => {
  const [user, setUser] = useState<any>();
  const [email, setEmail] = useState<any>();
  const [password, setPassword] = useState<any>();
  const [matchPassword, setMatchPassword] = useState<any>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const salt = bcrypt.genSaltSync(10);

  const invalidUsernames = [
    'username',
    'imbue',
    'imbuenetwork',
    'polkadot',
    'password',
    'admin',
  ];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
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
        utils.redirect(redirectUrl);
      } else {
        const error = await resp.json();
        setError({ message: error });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleChange = (event: any) => {
    if (!isValidEmail(event.target.value)) {
      setError('Email is invalid');
    } else {
      setError(null);
    }

    setEmail(event.target.value);
  };

  useEffect(() => {
    if (password != matchPassword) {
      setError('Passwords do not match');
    } else {
      setError(null);
    }

    if (password?.length < 5) {
      setError('Password must be at least 5 characters');
    }

    if (user?.length < 4) {
      setError('Username must be at least 4 characters');
    }

    if (invalidUsernames.includes(user)) {
      setError('Username is not allowed');
    }

    if (user === password) {
      setError('Username and password cannot be the same');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchPassword, password, user]);

  return (
    <form
      id='contribution-submission-form'
      name='contribution-submission-form'
      method='get'
      onSubmit={handleSubmit}
      className='w-full'
    >
      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Username
        </label>

        <input
          placeholder='Enter your Username'
          onChange={(e: any) => setUser(e.target.value)}
          required
          className='outlinedInput'
        />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Email
        </label>

        <input
          placeholder='Enter your Email'
          onChange={(e: any) => handleChange(e)}
          className='outlinedInput'
          required
          onError={(err) => console.log(err)}
          type='email'
        />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Password
        </label>

        <input
          placeholder='Enter your Password'
          onChange={(e: any) => setPassword(e.target.value)}
          className='outlinedInput'
          required
          type='password'
        />
        <PasswordStrengthBar password={password} />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-0'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Confirm Password
        </label>

        <input
          placeholder='Confirm your Password'
          onChange={(e: any) => setMatchPassword(e.target.value)}
          className='outlinedInput'
          required
          type='password'
        />
      </div>

      <div className='flex flex-wrap flex-row justify-center'>
        <span className={!error ? 'hide' : 'error'}>{error}</span>
      </div>
      <div className='flex justify-center mt-2 w-full cursor-pointer'>
        <button
          type='submit'
          disabled={password != matchPassword || loading || error}
          className='primary-btn in-dark w-full !text-center relative group !mx-0'
          id='create-account'
        >
          {loading && (
            <CircularProgress
              className='absolute left-2'
              thickness={5}
              size={25}
              color='info'
            />
          )}
          <span className='font-normal text-white group-hover:text-black'>
            {loading ? 'Signing up' : 'Sign Up'}
          </span>
        </button>
      </div>

      <div className='mx-auto w-fit mt-5'>
        <span className='text-imbue-purple-dark text-base'>
          Already have an account?
        </span>
        <span
          onClick={() => {
            setFormContent('login');
          }}
          className='signup text-imbue-coral ml-1 hover:underline cursor-pointer'
        >
          Sign In
        </span>
      </div>

      <div className='w-full my-4 flex justify-between items-center'>
        <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
        <p className='text-base text-imbue-purple-dark'>or</p>
        <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
      </div>
    </form>
  );
};

export default SignUp;
