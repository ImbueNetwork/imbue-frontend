/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Checkbox,
  CircularProgress,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import bcrypt from 'bcryptjs';
import dynamic from 'next/dynamic'
import React, { useEffect } from 'react';
import { useState } from 'react';
const PasswordStrengthBar = dynamic(() => import("react-password-strength-bar"));

import * as utils from '@/utils';

import { postAPIHeaders } from '@/config';

type SignUpFormProps = {
  setFormContent: (value: string) => void;
  redirectUrl: string;
};

const SignUp = ({ setFormContent, redirectUrl }: SignUpFormProps) => {
  const [user, setUser] = useState<any>();
  const [email, setEmail] = useState<any>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<any>();
  const [matchPassword, setMatchPassword] = useState<any>();
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
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

  const disableSubmit =
    password != matchPassword || loading || error || !agreedToTerms;

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

  const validatePassword = (password: string): boolean => {
    // Define a regular expression to check for at least one number and one special character
    const numberAndSpecialCharRegex =
      // eslint-disable-next-line no-useless-escape
      /^(?=.*\d)(?=.*[!\"#$%&'()*+,-.\/:;<=>?@[\\\]^_`{|}~]).*$/;

    // Check if the password length is between 6 and 15 characters and contains a number and a special character
    return (
      password?.length >= 6 &&
      password?.length <= 15 &&
      numberAndSpecialCharRegex.test(password)
    );
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
    if (user && user.includes(' ')) {
      setError('space is not allowed in username');
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
      className='w-full max-w-[450px]'
    >
      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Username
        </label>

        <input
          autoComplete='off'
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
          autoComplete='off'
        />
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Password
        </label>
        <OutlinedInput
          id='outlined-adornment-password'
          color='secondary'
          className='h-[2.6rem] pl-[6px]'
          placeholder='Enter your password'
          type={showPassword ? 'text' : 'password'}
          name='password'
          onChange={handleChange}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                aria-label='toggle password visibility'
                onClick={() => setShowPassword(!showPassword)}
                edge='end'
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
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
          autoComplete='off'
        />
      </div>

      <p className={`${!error ? 'hide' : 'error'} w-full text-sm text-center`}>
        {error}
      </p>

      <div className='flex items-center mb-2 justify-center'>
        <Checkbox
          required
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          color='secondary'
        />
        <p className='text-content'>
          I agree to the
          <span className='hover:underline cursor-pointer ml-1'>
            terms of services of Imbue
          </span>
        </p>
      </div>

      <div className='flex justify-center mt-2 w-full cursor-pointer'>
        <button
          type='submit'
          disabled={disableSubmit}
          className={`primary-btn in-dark w-full !text-center relative group !mx-0 ${
            disableSubmit && '!bg-gray-400 !text-white'
          }`}
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
          <span className='font-normal'>
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
    </form>
  );
};

export default SignUp;
