import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { CircularProgress, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { SignerResult } from "@polkadot/api/types";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { WalletAccount } from "@talismn/connect-wallets";
import bcrypt from 'bcryptjs';
// const PasswordStrengthBar = dynamic(() => import('react-password-strength-bar'));
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";

import * as utils from '@/utils';
import { matchedByUserName, matchedByUserNameEmail } from "@/utils";
import { isUrlAndSpecialCharacterExist, isValidEmail, validateInputLength } from "@/utils/helper";

import Carousel from "@/components/Carousel/Carousel";
import Web3WalletModal from "@/components/WalletModal/Web3WalletModal";

import * as config from '@/config';
import { postAPIHeaders } from '@/config';
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";


type FormErrorMessage = {
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
const invalidUsernames = [
  'username',
  'imbue',
  'imbuenetwork',
  'polkadot',
  'password',
  'admin',
];

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

export default function SignIn() {
  const [user, setUser] = useState<any>();
  const [email, setEmail] = useState<any>();
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<FormErrorMessage>(initialState);
  const router = useRouter()


  const fullData = user?.length && email?.length && password?.length;
  const ErrorFound = !!(error.confirmPassword?.length ||
    error.password?.length ||
    error.username?.length ||
    error.email?.length)

  const disableSubmit =
    !fullData ||
    loading || ErrorFound

  const salt = bcrypt.genSaltSync(10);

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
        utils.redirect("/dashboard");
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


  const handleChange = async (event: any) => {
    const { name, value } = event.target;
    if (name === 'user') {
      const data = await matchedByUserName(value);
      if (data?.id) {
        setError((val) => {
          return {
            ...val,
            username: 'Username already taken'
          }
        });
        return;
      }
      else if (invalidUsernames.includes(value)) {

        setError((val) => {
          return {
            ...val,
            username: 'Username is not allowed'
          }
        });
      }
      else if (value.includes(" ")) {
        setError((val) => {
          return {
            ...val,
            username: 'Username cannot contain spaces'
          }
        });
        return;
      }
      else if (!validateInputLength(value, 5, 30)) {
        setError((val) => {
          return {
            ...val,
            username: 'Username must be between 5 and 30 characters'
          }
        });
        return;
      }
      else if (isUrlAndSpecialCharacterExist(value)) {
        setError((val) => {
          return {
            ...val,
            username: 'Username cannot contain special characters or url'
          }
        });
        return;
      }
      else {
        setError((val) => {
          return {
            ...val,
            username: ''
          }
        });
        setUser(value);
      };
    }
    if (name === 'email') {
      const data = await matchedByUserNameEmail(value);

      if (!isValidEmail(value)) {
        setError((val) => {
          return {
            ...val,
            email: 'Email is invalid'
          }
        });
        return;
      }
      else if (data) {
        setError((val) => {
          return {
            ...val,
            email: 'Email already in use'
          }
        });
        return;
      }
      else {
        setError((val) => {
          return {
            ...val,
            email: ''
          }
        });
        setEmail(value);
      }
    }

    switch (name) {
      case 'password':
        if (value?.length < 5) {
          setError((val) => {
            return {
              ...val,
              password: 'password must be at least 5 characters'
            }
          });
          return;
        }
        else if (!validatePassword(value)) {
          setError((val) => {
            return {
              ...val,

              password: 'Password must be between 6 and 15 characters and contain at least one number and one special character'
            }
          });
        }
        else {
          setError((val) => {
            return {
              ...val,
              password: ''
            }
          });
        }
        setPassword(value);
        break;
      default:
        break;
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


  const closeModal = (): void => {
    showPolkadotAccounts(true);
  };

  return <div className="w-full flex justify-center ">
    <div className="bg-white flex space-x-5 p-2 rounded-2xl">
      <div className="left-side">
        <div className="left-side hidden lg:block  w-[28rem]  lg:w-[31.25rem]">
          <Carousel />
        </div>
      </div>
      <div className="content px-8 py-8">
        <h2 className="text-imbue-purple-dark text-3xl" >Sign up to Imbue Network</h2>
        <p className="text-[#9794AB]" >Make web3 work for you</p>
        <div className="flex sm:flex-row flex-col mt-4 items-center sm:space-x-4">
          <div className='login justify-center items-center w-full flex flex-col'>
            <li
              // ref={googleParentRef}
              className='mt-1 mb-2 w-full flex justify-center'
            >
              <GoogleOAuthProvider clientId={config?.googleClientId}>
                <GoogleLogin
                  width='200px'
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
          <div className='login justify-center items-center w-full flex flex-col'>
            <li
              className='mb-2 flex flex-row items-center cursor-pointer w-full'
              tabIndex={0}
              data-mdc-dialog-action='web3'
              onClick={() => closeModal()}
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
                  <p>Sign up with wallet</p>
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

        <form
          id='contribution-submission-form'
          name='contribution-submission-form'
          method='get'
          onSubmit={handleSubmit}
          className='w-full  max-w-[450px]'
        >
          <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
            <label className='font-Aeonik text-sm lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
              Email
            </label>

            <input
              placeholder='Enter your Email'
              onChange={handleChange}
              className='outlinedInput'
              required
              // eslint-disable-next-line no-console
              onError={(err) => console.error(err)}
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

          <div className="flex flex-col space-y-2 text-imbue-purple-dark items-center">
            <p className="text-black">Password strength requirement</p>
            <div className="flex text-[#A1A1A1] text-sm space-x-4">
              <div className="flex flex-col items-center">
                <p className="text-xl text-lime-600 font-semibold">8+</p>
                <p>Characters</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xl text-lime-600 font-semibold">AA</p>
                <p>Uppercase</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xl text-red-600 font-semibold">aa</p>
                <p>Lowercase</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xl text-gray-600 font-semibold">123</p>
                <p>Numbers</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xl text-gray-600 font-semibold" >$#^</p>
                <p>Symbol</p>
              </div>
            </div>
          </div>


          <div className='flex justify-center mt-2 w-full cursor-pointer'>
            <button
              type='submit'

              disabled={disableSubmit}
              className={`primary-btn in-dark w-full !text-center relative group !mx-0 ${disableSubmit && '!bg-gray-400 !text-white'
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
            <span className='text-[#9794AB] text-sm'>
              Already on Imbue?
            </span>
            <span
              className='signup text-imbue-purple-dark  ml-1 hover:underline cursor-pointer'
              onClick={() => { router.push("/auth/sign-in") }}
            >
              Sign In
            </span>
          </div>
        </form>
        <p className="text-xs text-black">By signing up, you agree with Imbue’s <a href='https://www.imbue.network/blogs/terms' target='_blank' className="underline">Terms & Conditions</a>  and Privacy Policy.</p>
      </div>
    </div>

    <Web3WalletModal
      {...{
        polkadotAccountsVisible,
        showPolkadotAccounts,
        accountSelected
      }}
    />
  </div>
}