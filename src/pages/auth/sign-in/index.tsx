
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { CircularProgress, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { SignerResult } from "@polkadot/api/types";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { WalletAccount } from "@talismn/connect-wallets";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

import * as utils from '@/utils';

import Carousel from '@/components/Carousel/Carousel';
const Web3WalletModal = dynamic(()=> import('@/components/WalletModal/Web3WalletModal'));

import dynamic from "next/dynamic";

import * as config from '@/config';
import { postAPIHeaders } from '@/config';
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";


export default function SignIn() {
  const [userOrEmail, setUserOrEmail] = useState<string>("");
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("")

  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (userOrEmail?.length < 1 || password?.length < 1) {
        setErrorMessage("incorrect username or password")
        return
      }
      const resp = await fetch(`${config.apiBase}auth/imbue/`, {
        headers: postAPIHeaders,
        method: 'post',
        body: JSON.stringify({
          userOrEmail,
          password,
        }),
      });

      if (resp.ok) {
        utils.redirect("/dashboard");
      } else {
        setErrorMessage('incorrect username or password');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

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
      // eslint-disable-next-line no-console
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


  const openModal = (): void => {
    showPolkadotAccounts(true);
  };



  return <div className="w-full flex justify-center ">
    <div className="bg-white flex space-x-5 p-2 rounded-2xl">
      <div className="left-side hidden lg:block  w-[28rem]  lg:w-[31.25rem]">
        <Carousel />
      </div>
      <div className="content px-4  lg:px-8 py-16">
        <h2 className="text-imbue-purple-dark text-3xl" >Login to your account</h2>
        <p className="text-[#9794AB]" >Welcome back to imbue</p>
        <div className="flex sm:flex-row flex-col mt-9 sm:space-x-4">
          <div className='login justify-center items-center w-full flex flex-col'>
            <li
              // ref={googleParentRef}
              className='mt-1 mb-2  w-full flex justify-center'
            >
              <GoogleOAuthProvider clientId={config?.googleClientId}>
                <GoogleLogin
                  width="200px"
                  logo_alignment='center'
                  shape='circle'
                  size='large'
                  useOneTap={true}
                  onSuccess={(creds: any) => googleLogin(creds)}
                  onError={() => {
                    // FIXME: error handling
                    // eslint-disable-next-line no-console
                    console.log('Login Failed');
                  }}
                />
              </GoogleOAuthProvider>
            </li>
          </div>
          <div className='login justify-center items-center w-full flex flex-col'>
            <li
              className='mb-2 flex flex-row items-center cursor-pointer w-full'
              tabIndex={0}
              data-mdc-dialog-action='web3'
              onClick={() => openModal()}
            >
              <button className='h-[2.6rem] rounded-[1.56rem] border  w-full justify-center bg-imbue-lime-light'>
                <div className='flex text-xs w-40 sm:text-sm sm:w-52  text-[#344F00] justify-center items-center'>
                  <Image
                    src={"/wallet.svg"}
                    width={32}
                    height={20}
                    alt='Wallet-icon'
                    className='relative right-2'
                  />
                  <p>Sign in with wallet</p>
                </div>
              </button>
            </li>
          </div>
        </div>
        <div className='w-full mt-8 mb-5 flex justify-between items-center'>
          <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
          <p className='text-base text-imbue-purple-dark'>or</p>
          <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
        </div>

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
        <div className='flex justify-center my-2 w-full cursor-pointer'>
          <button
            type='submit'
            disabled={loading}
            className='primary-btn in-dark w-full !text-center group !mx-0 relative'
            id='sign-in'
            onClick={handleSubmit}
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
        {errorMessage && <p className="text-imbue-coral text-center">{errorMessage}</p>}
        <div className="flex justify-center space-x-3 mt-5">
          <p className="text-[#9794AB]">New to Imbue?</p>
          <span
            onClick={() => { router.push("/auth/sign-up") }}
            className="text-imbue-purple-dark cursor-pointer " >Create An account</span>
        </div>
        <div className='w-full mt-8 mb-5 flex justify-between items-center'>
          <span className='h-[1px] w-[50%] bg-[#D9D9D9]' />

          <span className='h-[1px] w-[50%] bg-[#D9D9D9]' />
        </div>
        <p className="text-imbue-purple-dark text-xs">By signing up, you agree with Imbue’s <a href='https://www.imbue.network/blogs/terms' target='_blank' className='underline'> Terms & Conditions </a> and Privacy Policy.</p>
      </div>
    </div>

    {/* <AccountChoice
      accountSelected={(account: WalletAccount) => accountSelected(account)}
      visible={polkadotAccountsVisible}
      setVisible={showPolkadotAccounts}
    /> */}

    <Web3WalletModal
      {...{
        polkadotAccountsVisible,
        showPolkadotAccounts,
        accountSelected
      }}
    />

  </div>
}