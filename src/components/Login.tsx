import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import customStyled from 'styled-components';

import * as utils from '@/utils';

import AccountChoice from '@/components/AccountChoice';

import { walletIcon } from '@/assets/svgs';
import { postAPIHeaders } from '@/config';
import * as config from '@/config';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

type LoginProps = {
  visible: boolean;
  redirectUrl: string;
  setVisible: (_visible: boolean) => void;
};

const CustomInput = customStyled.input`
  height: 2.6rem;
  width: 100%;
  border-width: 1px;
  border-color: #03116a;
  border-radius: 0.25rem !important;
  padding: 0.62rem 1.25rem !important;
  outline: none;
  background-color: #fff;
  color: #03116A !important;
  
  ::placeholder,
  ::-webkit-input-placeholder {
    color: rgba(3, 17, 106, 0.30);
  }
  :-ms-input-placeholder {
     color: rgba(3, 17, 106, 0.30);
  }
`;

const Login = ({ visible, setVisible, redirectUrl }: LoginProps) => {
  const [userOrEmail, setUserOrEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);

  const googleParentRef = useRef<any>()

  const imbueLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage(undefined);
    event.preventDefault();

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
        // sx={(theme) => ({
        //   '& .MuiPaper-root': {
        //     backgroundColor: theme.palette.common.white,
        //     boxShadow: 'none',
        //     maxWidth: '100%',
        //     borderRadius: '1.25rem',
        //     padding: '6.25rem 11.78rem',

        //     '@media (max-width: 766px)': {
        //       padding: '1rem 0.5rem',
        //       width: '85%',
        //     },
        //     '@media (max-width: 1024px)': {
        //       padding: '2rem 1rem',
        //     },
        //   },
        // })}
        className='loginModal'
      >
        {
          <div className='lg:min-w-[450px] m-auto py-2'>
            <DialogTitle
              className='text-center text-imbue-purple-dark text-[1.5rem] lg:text-[2rem] font-normal font-Aeonik'
              id='responsive-dialog-title'
            >
              {'You must be signed in to continue'}
            </DialogTitle>
            <DialogContent
            className='mx-auto w-4/5'
            >
              <p className='text-base lg:text-xl text-imbue-purple-dark mb-7 relative text-center'>
                Please use the link below to sign in.
              </p>
              <div>
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
                      <CustomInput
                        placeholder='Enter your Username/Email'
                        onChange={(e: any) => setUserOrEmail(e.target.value)}
                        className='mdc-text-field'
                        required
                      />
                    </div>
                    <div className='flex flex-col justify-center pb-[10px] w-full mt-[1.2rem]'>
                      <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                        Password
                      </label>
                      <CustomInput
                        placeholder='Enter your password'
                        onChange={(e: any) => setPassword(e.target.value)}
                        type='password'
                        className='mdc-text-field'
                        required
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

                    <div className='w-full mt-8 mb-5'>
                      <button
                        type='submit'
                        // disabled={!this.state.creds.username && !this.state.creds.password}
                        className='primary-btn in-dark confirm w-full !text-center'
                        id='sign-in'
                      >
                        Sign In
                      </button>
                    </div>

                    <div>
                      <span className='text-imbue-purple-dark text-base'>
                        Don&apos;t have an account?
                      </span>
                      <Link
                        href='/join'
                        onClick={() => {
                          setVisible(false);
                        }}
                        className='signup text-imbue-coral ml-1 hover:underline'
                      >
                        Sign up
                      </Link>
                    </div>

                    <div className='w-full mt-8 mb-5 flex justify-between items-center'>
                      <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
                      <p className='text-base text-imbue-purple-dark'>or</p>
                      <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
                    </div>
                  </div>
                </form>

                <div className='login justify-center items-center w-full flex flex-col'>
                  <li ref={googleParentRef} className='mt-1 mb-2 w-full flex justify-center'>
                    <GoogleOAuthProvider clientId={config.googleClientId}>
                      {/* <button
                        // onClick={() => loginGoogleFunction()}
                        className='h-[2.6rem] rounded-[1.56rem] border border-imbue-purple-dark w-full justify-center'
                      >
                        <div className='flex text-imbue-purple-dark text-base justify-center items-center'>
                          <Image
                            src={googleIcon}
                            alt='Google-icon'
                            className='relative right-2'
                          />
                          Login with Google
                        </div>
                      </button> */}
                      <GoogleLogin
                        width={`${googleParentRef?.current?.clientWidth}`}
                        logo_alignment="center"
                        shape='circle'
                        size="large"
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

                <div className='login justify-center items-center w-full flex flex-col'>
                  <li
                    className='mt-4 flex flex-row items-center cursor-pointer w-full'
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
