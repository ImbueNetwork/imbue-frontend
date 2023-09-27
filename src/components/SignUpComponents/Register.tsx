import { CircularProgress, IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { SignerResult } from "@polkadot/api/types";
import { WalletAccount } from "@talismn/connect-wallets";
import bcrypt from 'bcryptjs';
// const PasswordStrengthBar = dynamic(() => import('react-password-strength-bar'));
import Image from "next/image";
import React from 'react';
import { useRef, useState } from "react";
// import PasswordStrengthBar from "react-password-strength-bar";
const PasswordStrengthBar = dynamic(() => import('react-password-strength-bar'), {
    ssr: false,
})

import dynamic from "next/dynamic";

import * as utils from '@/utils';
import { matchedByUserName, matchedByUserNameEmail } from "@/utils";
import { isUrlAndSpecialCharacterExist, isValidEmail, validateInputLength } from "@/utils/helper";

import GoogleSignIn from "@/components/GoogleSignIn";
import Web3WalletModal from "@/components/WalletModal/Web3WalletModal";

import { postAPIHeaders } from '@/config';
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";


// type RegisterProps = {
//     showSlider: boolean;
//     switchLogin: boolean;
// }


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

const Register = ({ setShowSignup, redirectUrl }: any) => {

    const [user, setUser] = useState<any>();
    const [email, setEmail] = useState<any>();
    const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<FormErrorMessage>(initialState);


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
                utils.redirect(redirectUrl || "/dashboard");
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
                utils.redirect(redirectUrl || "/dashboard");
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


    const closeModal = (): void => {
        showPolkadotAccounts(true);
    };

    const walletRef = useRef<any>(null)

    return (
        // <div className="w-full max-width-400px:mt-0 -mt-[100px] lg:mt-0 h-screen lg:h-auto flex justify-center items-center">
        <div className="flex justify-center items-center">
            <div className="bg-white flex sm:space-x-5 p-2 rounded-2xl mx-4">
                <div className="content px-4 sm:px-8 py-4 lg:py-8">
                    <h2 className="text-imbue-purple-dark text-[1.75rem]" >Sign up to Imbue Network</h2>
                    <p className="text-[#9794AB] mt-1" >Make web3 work for you</p>
                    <div className="flex sm:flex-row flex-col-reverse gap-2 mt-4 items-center">
                        <div className='login justify-center items-center w-full flex flex-col'>
                            <li
                                // ref={googleParentRef}
                                className='w-full flex justify-center'
                            >
                                <GoogleSignIn sizeRef={walletRef} />
                            </li>
                        </div>
                        <div ref={walletRef} className='login justify-center items-center w-full flex flex-col'>
                            <li
                                className='flex flex-row items-center cursor-pointer w-full'
                                tabIndex={0}
                                data-mdc-dialog-action='web3'
                                onClick={() => closeModal()}
                            >
                                <button className='h-[2.6rem] rounded-[1.56rem] border w-full justify-center hover:bg-imbue-lime-light transition-colors duration-300 px-5'>
                                    <div className='flex text-xs sm:text-sm  text-[#344F00] justify-center items-center'>
                                        <Image
                                            src={"/wallet.svg"}
                                            width={32}
                                            height={20}
                                            alt='Wallet-icon'
                                            className='relative right-2 w-5 lg:w-auto'
                                        />
                                        <p className="lg:font-medium font-semibold font-inter">Sign up with wallet</p>
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
                            <label className='font-Aeonik text-base lg:text-[1rem] text-imbue-purple-dark font-normal mb-2'>
                                Email
                            </label>

                            <input
                                placeholder='victorimbue@gmail.com'
                                onChange={handleChange}
                                className='outlinedInput text-[0.875rem]'
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
                            <label className='font-Aeonik text-base lg:text-[1rem] text-imbue-purple-dark font-normal mb-2'>
                                Username
                            </label>

                            <input
                                autoComplete='off'
                                placeholder='victordoe'
                                onChange={handleChange}
                                required
                                className='outlinedInput text-[0.875rem]'
                                name='user'
                            />
                            <p className={`${!error ? 'hide' : 'error'} w-full text-sm mt-1`}>
                                {error.username}
                            </p>
                        </div>

                        <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                            <label className='font-Aeonik text-base lg:text-[1rem] text-imbue-purple-dark font-normal mb-2'>
                                Password
                            </label>
                            <OutlinedInput
                                id='outlined-adornment-password'
                                color='secondary'
                                className='h-[2.6rem] pl-[6px] text-[0.875rem]'
                                inputProps={
                                    { className: 'placeholder:text-[#D1D1D1] !text-black' }
                                }
                                placeholder='*********'
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                onChange={handleChange}
                                endAdornment={
                                    <InputAdornment position='end'>
                                        <IconButton
                                            aria-label='toggle password visibility'
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge='end'
                                            className="mr-0"
                                        >
                                            {showPassword ? <Image className="h-5 w-5" src={require("../../assets/svgs/eye.svg")} alt="" /> : <Image className="w-5 h-5" src={require("../../assets/svgs/eyeClosed.svg")} alt="" />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                            <PasswordStrengthBar password={password} />
                            <p className={`${!error ? 'hide' : 'error'} w-full max-w-sm text-sm my-1`}>
                                {error.password}
                            </p>
                        </div>

                        <div className="flex flex-col space-y-2 text-imbue-purple-dark items-center">
                            <p className="text-black">Password strength requirement</p>
                            <div className="flex text-[#A1A1A1] text-sm space-x-4">
                                <div className="flex flex-col items-center">
                                    <p className="text-lg md:text-xl text-lime-600 font-semibold">8+</p>
                                    <p className="text-xs lg:text">Characters</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-lg md:text-xl text-lime-600 font-semibold">AA</p>
                                    <p className="text-xs lg:text">Uppercase</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-lg md:text-xl text-red-600 font-semibold">aa</p>
                                    <p className="text-xs lg:text">Lowercase</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-lg md:text-xl text-gray-600 font-semibold">123</p>
                                    <p className="text-xs lg:text">Numbers</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <p className="text-lg md:text-xl text-gray-600 font-semibold" >$#^</p>
                                    <p className="text-xs lg:text">Symbol</p>
                                </div>
                            </div>
                        </div>


                        <div className='flex justify-center mt-4 w-full cursor-pointer'>
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
                                onClick={() => setShowSignup(false)}
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
    )
}

export default Register;