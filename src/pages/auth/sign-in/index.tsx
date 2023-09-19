import ArrowBack from '@mui/icons-material/ArrowBackIosOutlined';
import CloselIcon from '@mui/icons-material/Close';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Backdrop, Box, CircularProgress, Fade, IconButton, InputAdornment, Modal, OutlinedInput } from "@mui/material";
import { SignerResult } from "@polkadot/api/types";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { getWallets, Wallet, WalletAccount } from "@talismn/connect-wallets";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import * as utils from '@/utils';

import Carousel from '@/components/Carousel/Carousel';

import * as config from '@/config';
import { postAPIHeaders } from '@/config';
import { authorise, getAccountAndSign } from "@/redux/services/polkadotService";

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  borderRadius: '24px',
  boxShadow: 24,
  minWidth: '50rem',
  height: '32rem',
};

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


  const [supportedWallets, setSuppotedWallets] = useState<Wallet[]>([]);
  console.log("🚀 ~ file: index.tsx:108 ~ SignIn ~ supportedWallets:", supportedWallets)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const [accounts, setAccounts] = useState<WalletAccount[]>([])

  useEffect(() => {
    const supportedWallets = getWallets();
    setSuppotedWallets(supportedWallets);
  }, [])

  const slides = [
    <Image key={"image-1"} src={"/FirstFrame.png"} height={700} width={500} alt="" />,
    <Image key={"image-2"} src={"/SecondFrame.png"} height={700} width={500} alt="" />,
    <Image key={"image-3"} src={"/ThirdFrame.png"} height={700} width={500} alt="" />,
  ];

  return <div className="w-full flex justify-center ">
    <div className="bg-white flex space-x-5 p-2 rounded-2xl">
      <div className="left-side w-[31.25rem]">
        <Carousel slides={slides}/>
      </div>
      <div className="content px-8 py-16">
        <h2 className="text-imbue-purple-dark text-3xl" >Login to your account</h2>
        <p className="text-[#9794AB]" >Welcome back to imbue</p>
        <div className="flex mt-9 space-x-4">
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
              className='mb-4 flex flex-row items-center cursor-pointer w-full'
              tabIndex={0}
              data-mdc-dialog-action='web3'
              onClick={() => openModal()}
            >
              <button className='h-[2.6rem] rounded-[1.56rem] border  w-full justify-center bg-imbue-lime-light'>
                <div className='flex text-sm w-52  text-[#344F00] justify-center items-center'>
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
        <p className="text-imbue-purple-dark text-xs">By signing up, you agree with Imbue’s Terms & Conditions and Privacy Policy.</p>
      </div>
    </div>
    {/* <AccountChoice
      accountSelected={(account: WalletAccount) => accountSelected(account)}
      visible={polkadotAccountsVisible}
      setVisible={showPolkadotAccounts}
    /> */}

    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={polkadotAccountsVisible}
      onClose={() => showPolkadotAccounts(false)}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={polkadotAccountsVisible}>
        <Box sx={style}>
          <div className="flex items-stretch h-full">
            <div className="w-1/2 p-6 border-r">
              <p className="text-black text-lg mb-4 font-semibold font-inter ml-2">Choose a Wallet</p>

              <p className="text-black text-sm text-opacity-70 mb-4 font-medium font-inter ml-2">Recommended</p>
              {
                supportedWallets.map((wallet, index) => (
                  <div
                    className={`flex items-center justify-between gap-5 p-2 rounded-lg hover:bg-imbue-lime hover:text-black ${selectedWallet?.extensionName === wallet.extensionName && "bg-imbue-purple text-white"} cursor-pointer transition-all duration-300`}
                    key={index}

                    onClick={async () => {
                      try {
                        if (!wallet.installed) return window.open(wallet.installUrl)

                        await wallet.enable('Imbue');
                        await wallet.subscribeAccounts((accounts: WalletAccount[] | undefined) => {
                          if (accounts?.length) {
                            setSelectedWallet(wallet)
                            setAccounts(accounts);
                          }
                        });
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(err)
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 ">
                      <Image height={40} width={40} src={wallet.logo.src} alt={wallet.logo.alt} />
                      <p className="text-base font-inter font-semibold">
                        {
                          wallet.title
                        }
                      </p>
                    </div>
                    <div>
                      {
                        wallet.installed
                          ? (
                            <div className="flex items-center gap-1 bg-imbue-purple text-white py-1.5 px-2 rounded-full">
                              <p className="text-xs">Installed</p>
                              <Image height={10} width={10} src={require('../../../assets/svgs/loader.svg')} alt="download wallet" />
                            </div>
                          )
                          : (
                            <div className="flex items-center gap-2">
                              <p className="text-xs">Get wallet</p>
                              <Image height={10} width={10} src={require('../../../assets/svgs/download.svg')} alt="download wallet" />
                            </div>
                          )
                      }
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="w-1/2 flex items-center justify-center h-full relative">
              {
                selectedWallet
                  ? (
                    <div className="h-auto max-h-full w-full p-7 str-chat">
                      <ArrowBack onClick={() => setSelectedWallet(null)} className='text-imbue-purple cursor-pointer absolute top-7 left-7' />
                      <CloselIcon onClick={() => showPolkadotAccounts(false)} className='text-imbue-purple cursor-pointer absolute top-7 right-7 rounded-full bg-[#EBEAE2] p-0.5' />
                      <p className="text-center font-inter font-semibold text-base mb-8">Select {selectedWallet.title} account</p>
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-96 pr-1">
                        {
                          accounts?.map((account) => (
                            <div
                              key={account.address}
                              className="py-4 px-6 rounded-xl bg-[#EBEAE2] hover:bg-imbue-light-purple cursor-pointer w-full"
                              onClick={() => accountSelected(account)}
                            >
                              <p className="text-sm text-black">{account.name}</p>
                              <p className="text-black text-xs">
                                {
                                  account?.address.substring(0, 12) +
                                  '...' +
                                  account?.address.substring(35)
                                }
                              </p>

                            </div>
                          ))
                        }
                      </div>
                    </div>)
                  : (
                    <div className="p-14">
                      <p className="text-center font-inter font-semibold text-base mb-8">About Wallets?</p>
                      <div className="flex items-start gap-4 mb-8">
                        <div className="w-14">
                          <Image className="object-cover" height={200} width={200} src={require('../../../assets/icons/polkadotIcon.png')} alt="recommended wallet" />
                        </div>
                        <div className="w-full">
                          <p className="text-sm font-semibold">We recommend Polkadot wallets</p>
                          <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Polkadot Wallets are built with you in mind. You can store digital assets and sign in securely without needing to trust a third party,</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mb-8">
                        <div className="w-14">
                          <Image className="object-cover" height={200} width={200} src={require('../../../assets/icons/digital_assets.png')} alt="recommended wallet" />
                        </div>
                        <div className="w-full">
                          <p className="text-sm font-semibold">A Home for your Digital Assets</p>
                          <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Wallets are used to send, receive, store, and display digital assets like Bitcoin and NFTs.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mb-8">
                        <div className="w-14">
                          <Image className="object-cover" height={200} width={200} src={require('../../../assets/icons/new_login.svg')} alt="recommended wallet" />
                        </div>
                        <div className="w-full">
                          <p className="text-sm font-semibold">A New Way to Log In</p>
                          <p className="text-xs text-[#B1B0B9] mt-1 leading-5">Instead of creating new accounts and passwords on every website, just connect your wallet instead.</p>
                        </div>
                      </div>
                    </div>
                  )
              }
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>




  </div>
}