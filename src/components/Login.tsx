/* eslint-disable no-console */
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { WalletAccount } from '@talismn/connect-wallets';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useState } from 'react';

import * as utils from '@/utils';

import AccountChoice from '@/components/AccountChoice';

import { walletIcon } from '@/assets/svgs';
import { postAPIHeaders } from '@/config';
import * as config from '@/config';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

const SignUp = dynamic(() => import("./SignUp"));

type LoginProps = {
  visible: boolean;
  redirectUrl: string;
  setVisible: (_visible: boolean) => void;
};

const Login = ({ visible, setVisible, redirectUrl }: LoginProps) => {
  const [userOrEmail, setUserOrEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [formContent, setFormContent] = useState<string>('login');

  const imbueLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage(undefined);
    setLoading(true);
    event.preventDefault();

    try {
      const resp = await fetch(`${config.apiBase}auth/imbue/`, {
        headers: postAPIHeaders,
        method: 'post',
        body: JSON.stringify({
          userOrEmail,
          password,
        }),
      });

      if (resp.ok) {
        utils.redirect(redirectUrl);
      } else {
        setErrorMessage('incorrect username or password');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = (): void => {
    showPolkadotAccounts(true);
    setVisible(false);
  };

  const googleLogin = async (response: any) => {
    const resp = await fetch(`${config.apiBase}auth/google/`, {
      headers: postAPIHeaders,
      method: 'post',
      body: JSON.stringify(response),
    });

    if (resp.ok) {
      utils.redirect(redirectUrl);
    } else {
      setErrorMessage('incorrect username or password');
    }
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
        utils.redirect(redirectUrl);
      }
    } catch (error) {
      // FIXME: error handling
      console.log(error);
    }
  };

  return (
    <>
      <Dialog
        open={visible}
        onClose={() => setVisible(false)}
        aria-labelledby='responsive-dialog-title'
        className='loginModal'
        maxWidth='xs'
      >
        {
          <div className='lg:min-w-[500px] m-auto'>
            <p
              className='text-center text-imbue-purple-dark text-[1.5rem] lg:text-[2rem] font-normal font-Aeonik'
            >
              {'You must be signed in to continue'}
            </p>
            <DialogContent className='mx-auto py-0'>
              <p className='text-base lg:text-xl text-imbue-purple-dark mb-7 relative text-center'>
                Please use the link below to sign in.
              </p>

              <div className='login justify-center items-center w-full flex flex-col'>
                <li
                  className='mb-4 flex flex-row items-center cursor-pointer w-full'
                  tabIndex={0}
                  data-mdc-dialog-action='web3'
                  onClick={() => closeModal()}
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
                </li>
              </div>

              <div className='login justify-center items-center w-full flex flex-col'>
                <li
                  // ref={googleParentRef}
                  className='mt-1 mb-2 w-full flex justify-center'
                >
                  <GoogleOAuthProvider clientId={config?.googleClientId}>
                    <GoogleLogin
                      width='400px'
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
                </li>
              </div>

              <div className='w-full mt-8 mb-5 flex justify-between items-center'>
                <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
                <p className='text-base text-imbue-purple-dark'>or</p>
                <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
              </div>

              <div>
                {formContent === 'login' ? (
                  <form
                    id='contribution-submission-form'
                    name='contribution-submission-form'
                    method='get'
                    onSubmit={imbueLogin}
                  >
                    <div className='login justify-center items-center w-full flex flex-col'>
                      <div className='flex flex-col justify-center pb-2 w-full'>
                        <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                          Username/Email
                        </label>
                        <OutlinedInput
                          id='outlined-adornment-password'
                          color='secondary'
                          className='h-[2.6rem] pl-[6px]'
                          type='text'
                          name='emailorUsername'
                          placeholder='Enter your Username/Email'
                          onChange={(e: any) => setUserOrEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className='flex flex-col justify-center pb-[10px] w-full mt-[1.2rem]'>
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
                          required
                          onChange={(e: any) => setPassword(e.target.value)}
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
                      </div>

                      <div>
                        <span className={!errorMessage ? 'hide' : 'error'}>
                          {errorMessage}
                        </span>
                      </div>

                      <span className='text-imbue-purple-dark text-base text-right hover:underline ml-auto cursor-pointer'>
                        Forgot password?
                      </span>

                      <div className='flex justify-center my-2 w-full cursor-pointer'>
                        <button
                          type='submit'
                          disabled={loading}
                          className='primary-btn in-dark w-full !text-center group !mx-0 relative'
                          id='sign-in'
                        >
                          {loading && (
                            <CircularProgress
                              className='absolute left-2'
                              thickness={5}
                              size={24}
                              color='info'
                            />
                          )}
                          <span className='font-normal text-white group-hover:text-black'>
                            {loading ? 'Signing In' : 'Sign In'}
                          </span>
                        </button>
                      </div>

                      <div>
                        <span className='text-imbue-purple-dark text-base'>
                          Don&apos;t have an account?
                        </span>
                        <span
                          onClick={() => {
                            setFormContent('join');
                          }}
                          className='signup text-imbue-coral ml-1 hover:underline cursor-pointer'
                        >
                          Sign up
                        </span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <SignUp {...{ setFormContent, redirectUrl }} />
                )}

              </div>
            </DialogContent>
          </div>
        }
      </Dialog>

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={polkadotAccountsVisible}
        setVisible={showPolkadotAccounts}
      />
    </>
  );
};

export default Login;
