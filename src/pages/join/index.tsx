/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
import { SignerResult } from '@polkadot/api/types';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { WalletAccount } from '@talismn/connect-wallets';
import bcrypt from 'bcryptjs';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useRef } from 'react';
import { useState } from 'react';

import * as utils from '@/utils';

import AccountChoice from '@/components/AccountChoice';
const Login = dynamic(() => import("@/components/Login"));

import { walletIcon } from '@/assets/svgs';
import { postAPIHeaders } from '@/config';
import * as config from '@/config';
import { authenticate } from '@/pages/api/info/user';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

const Join = (): JSX.Element => {
  const [user, setUser] = useState<any>();
  const [email, setEmail] = useState<any>();
  const [password, setPassword] = useState<any>();
  const [matchPassword, setMatchPassword] = useState<any>();
  const [error, setError] = useState<any>();

  const [visible, setVisible] = useState<boolean>(false);
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const googleParentRef = useRef<any>();

  // const router = useRouter();

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
      setError({ message: error });
    }
  };

  const closeModal = (): void => {
    showPolkadotAccounts(true);
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge as string,
        account
      );
      if (resp.ok) {
        utils.redirect('/dashboard');
      }
    } catch (error) {
      // FIXME: error handling
      console.log(error);
    }
  };

  const googleLogin = async (response: any) => {
    const resp = await fetch(`${config.apiBase}auth/google/`, {
      headers: postAPIHeaders,
      method: 'post',
      body: JSON.stringify(response),
    });

    if (resp.ok) {
      utils.redirect('/dashboard');
    } else {
      setError('incorrect username or password');
    }
  };

  const validateInputLength = (
    text: string,
    min: number,
    max: number
  ): boolean => {
    return text.length >= min && text.length <= max;
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z0-9])(?=.*[@#£&?]).{6,15}$/;
    return passwordRegex.test(password);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    switch (name) {
      case 'user':
        if (validateInputLength(value, 5, 30)) {
          setUser(value);
          setError('');
        } else {
          setError('Username must be between 5 and 30 characters');
          setUser(value);
        }
        break;
      case 'email':
        setEmail(value);
        setError('');
        break;
      case 'password':
        if (validatePassword(value)) {
          setPassword(value);
          setError('');
        } else {
          setError(
            'Password must be between 6 and 15 characters and contain at least one special character'
          );
          setPassword(value);
        }
        break;
      case 'matchPassword':
        setMatchPassword(value);
        break;
    }
  };

  return (
    <div>
      <div
        id='registration-form'
        className='registration-container bg-white w-[70%] py-5 -mt-3 rounded-2xl mx-auto'
      >
        <div className='flex flex-col w-[75%] justify-center items-center mx-auto'>
          <div className='flex flex-col gap-4'>
            <h1>Create account with imbue</h1>
            <p className='text-imbue-purple-dark text-center text-xl'>
              Please use the link below to sign in
            </p>
          </div>

          <div className='w-full max-w-[50%] mx-auto mt-3'>
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
                  autoComplete='off'
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

                <input
                  placeholder='Enter your Password'
                  onChange={handleChange}
                  className='outlinedInput'
                  required
                  type='password'
                  name='password'
                  autoComplete='off'
                />
              </div>

              <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                  Confirm Password
                </label>

                <input
                  placeholder='Confirm your Password'
                  onChange={handleChange}
                  className='outlinedInput'
                  required
                  type='password'
                  name='matchPassword'
                  autoComplete='off'
                />
              </div>

              <div className='flex flex-wrap flex-row justify-center'>
                <span className={!error ? 'hide' : 'error'}>{error}</span>
              </div>
              <div className='flex justify-center mt-2 w-full'>
                <input
                  type='submit'
                  disabled={password != matchPassword || error}
                  className='primary-btn in-dark confirm w-full !text-center'
                  id='create-account'
                  value={'Sign Up'}
                  autoComplete='off'
                />
              </div>

              <div className='mx-auto w-fit mt-5'>
                <span className='text-imbue-purple-dark text-base'>
                  Already have an account?
                </span>
                <span
                  onClick={() => {
                    setVisible(true);
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

              <div className='login flex flex-col justify-center items-center w-full'>
                <GoogleOAuthProvider clientId={config?.googleClientId}>
                  <GoogleLogin
                    width={`${googleParentRef?.current?.clientWidth}`}
                    logo_alignment='center'
                    shape='circle'
                    size='large'
                    useOneTap={true}
                    onSuccess={(creds: any) => googleLogin(creds)}
                    onError={() => {
                      // FIXME: error handling
                      console.log('Login Failed');
                    }}
                  />
                </GoogleOAuthProvider>
              </div>
            </form>
            <div
              onClick={() => closeModal()}
              className='login justify-center items-center w-full flex flex-col cursor-pointer'
            >
              <button className='h-[2.6rem] rounded-[1.56rem] border border-imbue-purple-dark w-full justify-center bg-[#E1DDFF]'>
                <div className='flex text-imbue-purple-dark text-base justify-center items-center'>
                  <Image
                    src={walletIcon}
                    alt='Wallet-icon'
                    className='relative right-2'
                  />
                  Sign in with a wallet
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={polkadotAccountsVisible}
        setVisible={showPolkadotAccounts}
      />

      <Login
        visible={visible}
        setVisible={setVisible}
        redirectUrl='/dashboard'
      />
    </div>
  );
};

export const getServerSideProps = async (context: any) => {
  const { req, res } = context;
  // Check the authentication state here.
  const user = await authenticate('jwt', req, res);

  const isAuthenticated = user; // Replace this with your actual authentication check

  if (isAuthenticated) {
    // If the user is logged in, redirect them to another page (e.g., dashboard)
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  // If the user is unauthenticated, they can access this page.
  return {
    props: {},
  };
};

export default Join;
