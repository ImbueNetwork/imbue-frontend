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
import dynamic from 'next/dynamic';
import React from 'react';
import { useState } from 'react';
const PasswordStrengthBar = dynamic(() => import("react-password-strength-bar"));

import * as utils from '@/utils';
import { matchedByUserName, matchedByUserNameEmail } from '@/utils';
import { isUrlAndSpecialCharacterExist } from '@/utils/helper';

import { postAPIHeaders } from '@/config';

type SignUpFormProps = {
  setFormContent: (value: string) => void;
  redirectUrl: string;
};

type FormErrorMessage={
  username: string
  email: string
  password: string
  confirmPassword: string
}

const initialState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const SignUp = ({ setFormContent, redirectUrl }: SignUpFormProps) => {
  const [user, setUser] = useState<any>();
  const [email, setEmail] = useState<any>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<any>();
  const [matchPassword, setMatchPassword] = useState<any>();
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [error, setError] = useState<FormErrorMessage>(initialState);
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

  const fullData = user?.length && email?.length && password?.length;
  const ErrorFound = !!(error.confirmPassword?.length ||
                     error.password?.length ||
                     error.username?.length || 
                     error.email?.length)

  const disableSubmit =
    !fullData ||
    password != matchPassword ||
    loading || ErrorFound || 
    !agreedToTerms;

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

  const handleChange = async (event: any) => {
    const { name, value } = event.target;
    if (name === 'user') {
      const data = await matchedByUserName(value);
      if (data?.id) {
        setError((val)=>{return {
          ...val,
          username: 'Username already taken'
        }} );
        return;
      } 
      else if(invalidUsernames.includes(value)){
         
        setError((val)=>{return {
          ...val,
          username: 'Username is not allowed'
        }});
      }
      else if(value.includes(" ")){
        setError((val)=> {return {
        ...val,
          username: 'Username cannot contain spaces'
        }} );
        return;
      }
      else if(!validateInputLength(value, 5, 30)){
        setError( (val)=> {return {
        ...val,
          username: 'Username must be between 5 and 30 characters'
        }} );
        return;
      }
      else if(isUrlAndSpecialCharacterExist(value)) {
        setError( (val)=> {return {
          ...val,
          username: 'Username cannot contain special characters or url'
        }} );
        return;
      }
      else {
        setError( (val)=> {return {
          ...val,
          username: ''
        }} );
        setUser(value);
      };
    }
    if(name === 'email') {
     const data = await matchedByUserNameEmail(value);
     
     if (!isValidEmail(value)) {
      setError( (val)=> {return {
      ...val,
        email: 'Email is invalid'
      }} );
      return;
    } 
    else if(data){
      setError( (val)=> {return {
       ...val,
         email: 'Email already in use'
      }} );
      return;
     }
     else {
      setError( (val)=> {return {
        ...val,
          email: ''
        }} );
      setEmail(value);
    }
    }

    switch (name) {
      case 'password':
        if(value?.length < 5){
          setError( (val)=> {return {
          ...val,
            password: 'password must be at least 5 characters'
          }} );
          return;
        }
        else if(!validatePassword(value)){
          setError( (val)=> {return {
         ...val,

          password: 'Password must be between 6 and 15 characters and contain at least one number and one special character'
          } } );
        }
        else {
          setError( (val)=> {return {
            ...val,
              password: ''
            }} );
        }
        setPassword(value);
        break;
      case 'matchPassword':
        if (value !== password) {
          setError((val)=>{return {
            ... val,
            confirmPassword:"Passwords do not match"
          }});
        } else {
          setError((val)=>{return {
            ... val,
            confirmPassword:""
          }});
          setMatchPassword(value);
        }
        break;
      default:
        break;
    }
  };


  return (
    
    <form
      id='contribution-submission-form'
      name='contribution-submission-form'
      method='get'
      onSubmit={handleSubmit}
      className='w-full  max-w-[450px]'
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
        <p className={`${!error ? 'hide' : 'error'} w-full text-sm mt-1`}>
        {error.username}
      </p>
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
        <p className={`${!error ? 'hide' : 'error'} w-full text-sm mt-1`}>
        {error.email}
      </p>
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
        <p className={`${!error ? 'hide' : 'error'} w-full text-sm mt-1`}>
        {error.password}
      </p>
      </div>

      <div className='flex flex-col justify-center pb-[10px] w-full mt-0'>
        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
          Confirm Password
        </label>

        <input
          placeholder='Confirm your Password'
          onChange={handleChange}
          className='outlinedInput'
          required
          name='matchPassword'
          type='password'
          autoComplete='off'
        />
        <p className={`${!error ? 'hide' : 'error'} w-full text-sm mt-1`}>
        {error.confirmPassword}
      </p>
      </div>

      {/* <p className={`${!error ? 'hide' : 'error'} w-full text-sm text-center`}>
        {error}
      </p> */}

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
