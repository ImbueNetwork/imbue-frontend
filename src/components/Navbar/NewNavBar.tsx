/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  Skeleton,
  Tooltip,
} from '@mui/material';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BiBuildings } from 'react-icons/bi';
import { BsPeople } from 'react-icons/bs';
import { IoIosArrowDown } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';

import { appLogo, cancelIcon, hamburgerIcon } from '@/assets/svgs';
import { fetchUserRedux } from '@/redux/reducers/userReducers';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { AppDispatch, RootState } from '@/redux/store/store';

import MenuItems from './MenuItems';
const Login = dynamic(() => import('../Login'));

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

  const { user, loading: loadingUser } = useSelector(
    (state: RootState) => state.userState
  );
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
    'text-imbue-purple h-[3rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center px-7 hover:no-underline !text-[1rem] ';
  const cancelClass =
    'text-imbue-purple h-[2.9375rem] w-[2.9375rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center px-7 hover:no-underline !text-[1.10975rem] ';

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

            <div className='relative items-center bg-[#DFDDCD] ml-5 py-1 rounded-full lg:flex'>
              <div className={`flex items-center ml-0.5  transition-all`}>
                <div
                  className={`mx-1 lg:text-sm relative  lg:inline-block cursor-pointer text-imbue-purple h-[3rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center pl-5 pr-3 hover:no-underline !text-[1rem]`}
                >
                  <Image
                    src='/target.svg'
                    width={20}
                    className='mr-1'
                    height={20}
                    alt=''
                  />
                  <p>Discover</p>
                  <IoIosArrowDown color='#A8A8A8' className='ml-3' size={20} />
                  <div className='absolute shadow-lg space-y-3 pl-1  py-1 rounded-xl top-14 left-1 bg-white w-72'>
                    <div className='flex gap-2 px-2 hover:bg-imbue-lime-light py-2 rounded-md '>
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
                    <div className='flex gap-2 px-2 hover:bg-imbue-lime-light py-2 rounded-md '>
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
                {user?.id && (
                  <Link
                    onClick={() => setExpanded(false)}
                    className={`mx-1 lg:text-sm lg:inline-block cursor-pointer ${navPillclasses}`}
                    href='/grants/new'
                  >
                    Submit a Grant
                  </Link>
                )}
                <Link
                  onClick={() => setExpanded(false)}
                  className={`mx-1 text-xs lg:text-sm hidden lg:inline-block cursor-pointer ${navPillclasses} nav-item nav-item-2`}
                  href='/briefs/'
                >
                  Discover Briefs
                </Link>
                <Link
                  onClick={() => setExpanded(false)}
                  className={`mx-1 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline ${navPillclasses}`}
                  href='/freelancers'
                >
                  Discover Freelancers
                </Link>
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
            sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}
          >
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
