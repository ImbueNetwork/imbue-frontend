/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */

import { SignerResult } from '@polkadot/api/types';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useState } from 'react';

import * as utils from '@/utils';

import AccountChoice from '@/components/AccountChoice';
import Login from '@/components/Login';
import SignUp from '@/components/SignUp';

import { walletIcon } from '@/assets/svgs';
import * as config from '@/config';
import { postAPIHeaders } from '@/config';
import { authenticate } from '@/pages/api/info/user';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';





const Join = (): JSX.Element => {
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const [ loginModal ,setLoginModal] = useState("signup");
  const closeLogInModal = (val:boolean)=>{
    if(val === false){
      setLoginModal("signup");
    }
  }
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
        utils.redirect("/dashboard");
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
      utils.redirect("/dashboard");
    } else {
     alert('incorrect username or password');
    }
  };



  


  return (
    <>
    <Login redirectUrl='/dashboard' setVisible={closeLogInModal}  visible={loginModal === "login"} />
   <div className='w-full flex justify-center'>
           <div className='px-10 py-10 bg-white rounded-2xl'>
            <div className='lg:min-w-[500px]  m-auto'>
            <p
              className='text-center text-imbue-purple-dark text-[1.5rem] lg:text-[2rem] font-normal font-Aeonik'
            >
              {'You must be signed in to continue'}
            </p>
           
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

              <div className='flex justify-center'>
                  <SignUp setFormContent={setLoginModal} redirectUrl={"/dashboard"} />
              </div>
            
          </div>
          <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={polkadotAccountsVisible}
        setVisible={showPolkadotAccounts}
      />
      </div>
   </div>
   </>)
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
