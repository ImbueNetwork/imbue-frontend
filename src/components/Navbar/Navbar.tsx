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
  useMediaQuery,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { appLogo, cancelIcon, hamburgerIcon } from '@/assets/svgs';
import { fetchUser } from '@/redux/reducers/userReducers';
import { getFreelancerProfile } from '@/redux/services/freelancerService';
import { AppDispatch, RootState } from '@/redux/store/store';

import MenuItems from './MenuItems';
import Login from '../Login';
import defaultProfile from '../../assets/images/profile-image.png';

function Navbar() {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [freelancerProfile, setFreelancerProfile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [solidNav, setSolidNav] = useState<boolean>(false);

  const router = useRouter();

  const mobile = useMediaQuery('(max-width:600px)');

  const feedbackLink = 'https://pfljr3ser45.typeform.com/to/bv00pviH';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openMenu, setOpenMenu] = useState(false);

  const user = useSelector((state: RootState) => state.userState.user);
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
      dispatch(fetchUser());
      try {
        if (user?.username) {
          const res = await getFreelancerProfile(user.username);
          setFreelancerProfile(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, [dispatch, user.username]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled: boolean = window.scrollY > 50;
      setSolidNav(isScrolled);
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigateToPage = (url: string) => {
    if (user?.username) {
      router.push(url);
    } else {
      setLoginModal(true);
    }
  };

  const navPillclasses =
    'text-imbue-purple h-[2.9375rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center px-[3rem] hover:no-underline !text-[1.10975rem] ';
  const cancelClass =
    'text-imbue-purple h-[2.9375rem] !bg-white rounded-[5.07319rem] !flex justify-center items-center px-[0.9rem] hover:no-underline !text-[1.10975rem] ';

  return (
    <>
      <header className={`navBar bg-transparent`} id='header-wrapper'>
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
          className='flex justify-between items-center px-4 lg:px-8 py-2 my-[0.9rem]'
        >
          <div className={`flex items-center`}>
            <h1
              onClick={() => router.push('/')}
              className={`main-title h-[2.9375rem] !bg-white rounded-[5.07319rem] w-full flex justify-center items-center cursor-pointer`}
            >
              <div id='logo'>
                <Image src={appLogo} alt={'app logo'} className='w-full' />
              </div>
            </h1>

            {!mobile && (
              <>
                {expanded && (
                  <div className={`flex items-center ml-[2rem]`}>
                    <span
                      className={`mx-1 lg:text-sm lg:inline-block cursor-pointer ${navPillclasses}`}
                      onClick={() => navigateToPage('/briefs/new')}
                    >
                      Submit a Brief
                    </span>

                    <Link
                      className={`mx-1 text-xs lg:text-sm hidden lg:inline-block cursor-pointer ${navPillclasses} nav-item nav-item-2`}
                      href='/briefs/'
                    >
                      Discover Briefs
                    </Link>

                    <Link
                      className={`mx-1 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline ${navPillclasses}`}
                      href='/freelancers'
                    >
                      Discover Freelancers
                    </Link>
                  </div>
                )}
                <div
                  onClick={() => {
                    setExpanded(!expanded);
                  }}
                  className={`mx-1 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline ${cancelClass}`}
                >
                  <Image
                    src={expanded ? cancelIcon : hamburgerIcon}
                    alt={'cancel'}
                    className='w-2/3 lg:w-full'
                  />
                </div>
              </>
            )}
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
                        src={freelancerProfile?.profile_image || defaultProfile}
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

            {!user.username && (
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
      <Login
        visible={loginModal}
        setVisible={(val: any) => {
          setLoginModal(val);
        }}
        redirectUrl={router?.asPath}
      />
    </>
  );
}

export default Navbar;
