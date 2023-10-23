'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  Skeleton,
  Tooltip,
} from '@mui/material';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BiBuildings } from 'react-icons/bi';
import { BsPeople } from 'react-icons/bs';
import { IoIosArrowDown } from 'react-icons/io';
import { MdOutlineAccountBalance } from 'react-icons/md';
import { MdOutlineWork } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { appLogo } from '@/assets/svgs';
import { fetchUserRedux } from '@/redux/reducers/userReducers';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { AppDispatch, RootState } from '@/redux/store/store';

import MenuItems from './MenuItems';
const Login = dynamic(() => import('../Login'));

import NotificationIcon from './NotificationIcon';
import LoginPopup from '../LoginPopup/LoginPopup';
import defaultProfile from '../../assets/images/profile-image.png';

function NewNavbar() {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [freelancerProfile, setFreelancerProfile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const router = useRouter();

  const feedbackLink = 'https://pfljr3ser45.typeform.com/to/bv00pviH';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openMenu, setOpenMenu] = useState(false);

  const {
    user,
    loading: loadingUser,
    message,
  } = useSelector((state: RootState) => state.userState);
  const dispatch = useDispatch<AppDispatch>();

  const [expanded, setExpanded] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(Boolean(event.currentTarget));
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  useEffect(() => {
    const setup = async () => {
      dispatch(fetchUserRedux());
      try {
        if (user?.username) {
          const res = await getFreelancerProfile(user.username);
          setFreelancerProfile(res);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, [dispatch, user?.username]);

  const navigateToPage = (url: string) => {
    if (user?.username) {
      router.push(url);
    } else {
      setLoginModal(true);
    }
  };

  const navPillclasses =
    'text-imbue-purple-dark h-[3rem] bg-white  rounded-[5.07319rem] !flex justify-center items-center px-5 hover:no-underline !text-[1rem] ';

  return (
    <>
      <header className={`navBar bg-[#ebeae2]`} id='header-wrapper'>
        <div className='text-center w-full bg-primary text-black py-1 text-xs lg:text-sm'>
          Thanks for trying the beta version of Imbue. Please let us know what
          we should work on to make it better! Submit your feedback
          <a
            href={feedbackLink}
            target='_blank'
            className='underline cursor-pointer ml-1'
          >
            here
          </a>
        </div>
        <div
          id='main-header'
          className='flex justify-between items-center px-4 lg:px-8 py-2'
        >
          <div className={`flex items-center transition-all`}>
            <div
              onClick={() => router.push('/')}
              className={`bg-white w-[12rem] rounded-full  flex justify-center items-center cursor-pointer z-10 relative px-9 py-3 `}
            >
              <div id='logo'>
                <Image
                  src={appLogo}
                  alt={'app logo'}
                  className='w-[6.875rem]'
                />
              </div>
            </div>

            <div className='relative  max-width-1100px:hidden items-center bg-[#DFDDCD] ml-5 py-1 rounded-full lg:flex'>
              <div className={`flex items-center ml-0.5  transition-all`}>
                <div
                  className={`mx-1 group lg:text-sm relative  lg:inline-block cursor-pointer text-imbue-purple h-[3rem] bg-white hover:bg-imbue-lime-light rounded-[5.07319rem] !flex justify-center items-center pl-5 pr-3 hover:no-underline !text-[1rem]`}
                >
                  <Image
                    src='/target.svg'
                    width={20}
                    className='mr-1'
                    height={20}
                    alt=''
                  />
                  <p>Discover</p>
                  <IoIosArrowDown
                    className='ml-3 text-[#A8A8A8] group-hover:text-black'
                    size={20}
                  />
                  <div className='absolute hidden bg-transparent  group-hover:block  space-y-3  rounded-xl top-3 left-1  w-72'>
                    <div className='bg-white mt-10 rounded-lg pl-1 shadow-lg py-1'>
                      <div
                        onClick={() => {
                          router.push('/briefs');
                        }}
                        className='flex gap-2 px-2 hover:bg-imbue-lime-light py-2 rounded-md '
                      >
                        <div className='border p-1 rounded-xl'>
                          <BiBuildings color='black' size={23} />
                        </div>
                        <div className='ml-1'>
                          <p className='text-sm'>Discover Briefs</p>
                          <p className='text-xs text-gray-400'>
                            Apply for client work on imbue
                          </p>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          router.push('/freelancers');
                        }}
                        className='flex gap-2 px-2 hover:bg-imbue-lime-light py-2 rounded-md '
                      >
                        <div className='border p-1  rounded-xl'>
                          <BsPeople color='black' size={23} />
                        </div>
                        <div className='ml-1'>
                          <p className='text-sm'>Discover Freelancers</p>
                          <p className='text-xs text-gray-400'>
                            Find and Hire Super Freelancers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {user?.id ? (
                  <div
                    className={`mx-1 hover:bg-imbue-lime-light relative group  lg:text-sm lg:inline-block cursor-pointer ${navPillclasses}`}
                  >
                    <div className='flex'>
                      <Image
                        className='mr-2'
                        src={'/page.svg'}
                        width={16}
                        height={20}
                        alt='page icon'
                      />
                      Submit
                      <IoIosArrowDown
                        className='ml-3 text-[#A8A8A8] group-hover:text-black'
                        size={20}
                      />
                    </div>

                    <div className='absolute hidden bg-transparent group-hover:block  space-y-3  rounded-xl top-3 left-1 w-72'>
                      <div className='bg-white mt-10 rounded-lg pl-1 shadow-lg py-1'>
                        <div
                          onClick={() => {
                            router.push('/grants/new');
                          }}
                          className='flex gap-2 px-2 hover:bg-imbue-lime-light items-center py-2 rounded-md '
                        >
                          <div className='border p-1 rounded-xl'>
                            <MdOutlineAccountBalance color='black' size={20} />
                          </div>
                          <div className='ml-1'>
                            <p className='text-sm'>Submit Grant</p>
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            router.push('/briefs/new');
                          }}
                          className='flex gap-2 px-2 items-center hover:bg-imbue-lime-light py-2 rounded-md '
                        >
                          <div className='border p-1  rounded-xl'>
                            <MdOutlineWork color='black' size={20} />
                          </div>
                          <div className='ml-1'>
                            <p className='text-sm'>Submit Brief</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <div
                  onClick={() => {
                    if (user.id) {
                      setExpanded(false);
                      router.push('/relay');
                    } else setLoginModal(true);
                  }}
                  className={`mx-1 hover:bg-imbue-lime-light text-xs lg:text-sm hidden lg:inline-block cursor-pointer ${navPillclasses} nav-item nav-item-2`}
                >
                  <Image
                    src='/wallet-2.svg'
                    alt='wallet icon'
                    width={21}
                    height={18}
                    className='mr-2 mb-1'
                  />
                  Wallet
                </div>
                {/* <Link
                  onClick={() => setExpanded(false)}
                  className={`mx-1 relative group text-xs hover:bg-imbue-lime-light lg:text-sm hidden lg:inline-block cursor-pointer hover:underline ${navPillclasses}`}
                  href='#'
                >
                  <Image
                    src='/user-edit.svg'
                    className='mr-2 mb-0.5'
                    width={20}
                    height={20}
                    alt=''
                  />
                  Switch Profile
                  <IoIosArrowDown
                    className='ml-3 text-[#A8A8A8] group-hover:text-black'
                    size={20}
                  />
                  <div className='absolute hidden  group-hover:block shadow-lg space-y-3 pl-1  py-1 rounded-xl top-[3.3rem] left-1 bg-white w-72'>
                    <div className='flex gap-2 items-center px-2 hover:bg-imbue-lime-light py-2 rounded-md '>
                      <div className='border p-1 rounded-xl'>
                        <BiBuildings color='black' size={23} />
                      </div>
                      <div className='ml-1'>
                        <p className='text-sm'>Switch to Hiring</p>
                      </div>
                    </div>
                  </div>
                </Link> */}
              </div>
            </div>
          </div>

          {/* <div className="context-menu" id="context-menu">
            <div className="context-menu-item" onClick={toggleSideBar}>
              <a id="main-menu" className="material-icons">
                &#xe5d2;
              </a>
            </div>
          </div> */}

          <Box
            sx={{
              background: '#DFDDCD',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              paddingLeft: 2,
              paddingRight: 2,
            }}
          >
            {user.id && (
              <Badge className='mr-3' badgeContent={message} color='error'>
                <Image
                  src='/message-dots-square.svg'
                  width={23}
                  height={20}
                  onClick={() => router.push('/dashboard/message')}
                  alt='message'
                  className='cursor-pointer'
                />
              </Badge>
            )}
            {user.id && <NotificationIcon />}
            <Tooltip
              title='Account settings'
              className={`${!user?.username && !loading && 'lg:hidden'}`}
            >
              {loading ? (
                <Skeleton variant='circular' width={40} height={40} />
              ) : (
                <IconButton
                  onClick={(e) => handleClick(e)}
                  size='small'
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup='true'
                  aria-expanded={open ? 'true' : undefined}
                >
                  {user?.username ? (
                    <Avatar className='w-8 h-8 lg:w-10 lg:h-10'>
                      <Image
                        src={user?.profile_photo ?? defaultProfile}
                        width={40}
                        height={40}
                        alt='profile'
                      />
                    </Avatar>
                  ) : (
                    <div
                      className={`mx-1 text-xs lg:text-sm lg:inline-block cursor-pointer text-imbue-purple h-[2.9375rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center px-[0.8rem] hover:no-underline !text-[1.10975rem] `}
                    >
                      {openMenu ? (
                        <CloseIcon htmlColor='#3B27C1' />
                      ) : (
                        <div onClick={() => setOpenMenu(!openMenu)}>
                          {openMenu ? (
                            <CloseIcon htmlColor='#3B27C1' />
                          ) : (
                            <MenuIcon htmlColor='#3B27C1' />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </IconButton>
              )}
            </Tooltip>
            {!loadingUser && !user.username && (
              <button
                className='mx-1 text-xs lg:text-sm bg-theme-grey-dark hover:bg-primary hover:text-black transition-all px-6 py-2 rounded-full hidden lg:inline-block'
                onClick={() => setLoginModal(true)}
              >
                Sign In
              </button>
            )}
          </Box>
        </div>

        <Menu
          disableScrollLock={true}
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          className='navBar'
        >
          <MenuItems
            isFreelancer={freelancerProfile?.id ? true : false}
            {...{ user, setLoginModal, handleClose }}
          />
        </Menu>
      </header>
      {/* <Login
        visible={loginModal}
        setVisible={(val: any) => {
          setLoginModal(val);
        }}
        redirectUrl={router?.asPath}
      /> */}
      <LoginPopup
        visible={loginModal}
        setVisible={(val: any) => {
          setLoginModal(val);
        }}
        redirectUrl={router?.asPath}
      />
    </>
  );
}

export default NewNavbar;
