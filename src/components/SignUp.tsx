/* eslint-disable react-hooks/exhaustive-deps */
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
        const errorMessage = await resp.json();

        setError(errorMessage);
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

  const validateInputLength = (
    text: string,
    min: number,
    max: number
  ): boolean => {
    return text.length >= min && text.length <= max;
  };

  const validatePassword = (passwordString: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z0-9])(?=.*[@#£&?.]).{6,15}$/;
    return passwordRegex.test(passwordString);
  };

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    switch (name) {
      case 'email':
        if (!isValidEmail(value)) {
          setError('Email is invalid');
        } else {
          setEmail(value);
          setError(null);
        }
        break;
      case 'user':
        if (!validateInputLength(value, 5, 30)) {
          setError('Username must be between 5 and 30 characters');
        } else {
          setUser(value);
          setError(null);
        }
        break;
      case 'password':
        setPassword(value);
        break;
      case 'matchPassword':
        if (value !== password) {
          setError('Passwords do not match');
        } else {
          setMatchPassword(value);
          setError(null);
        }
        break;
      default:
        break;
    }
  };

  const validateInput = () => {
    if (password !== matchPassword) {
      setError('Passwords do not match');
      return;
    }

    if (user && email && user.toLowerCase() === email.toLowerCase()) {
      setError('Username and email cannot be the same');
      return;
    }

    if (user && isValidEmail(user)) {
      setError('Username cannot be an email');
      return;
    }

    if (password && password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }

    if (user && user.length < 4) {
      setError('Username must be at least 4 characters');
      return;
    }

    if (user && invalidUsernames.includes(user)) {
      setError('Username is not allowed');
      return;
    }

    if (user && password && user.toLowerCase() === password.toLowerCase()) {
      setError('Username and password cannot be the same');
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Password must be between 6 and 15 characters and contain at least one number and one special character'
      );
      return;
    }

    setError(null);
  };

  useEffect(() => {
    validateInput();
  }, [matchPassword, password, user, email]);

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
          onChange={handleChange}
          required
          className='outlinedInput'
          name='user'
        />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Email
        </label>

        <input
          placeholder='Enter your Email'
          onChange={handleChange}
          className='outlinedInput'
          required
          onError={(err) => console.log(err)}
          type='email'
          name='email'
        />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Password
        </label>

        <input
          placeholder='Enter your Password'
          onChange={handleChange}
          className='outlinedInput'
          required
          type='password'
          name='password'
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

      <div className='flex flex-wrap flex-row justify-center break-words w-fit px-4'>
        <span className={`${!error ? 'hide' : 'error'} w-fit`}>{error}</span>
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
