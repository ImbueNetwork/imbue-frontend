import { ListItemIcon, MenuItem } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { BiBuildings } from 'react-icons/bi';

import { AppContext, AppContextType } from '../Layout';
import defaultProfile from '../../assets/images/profile-image.png';

const MenuItems = ({ user, isFreelancer, setLoginModal, handleClose }: any) => {
  const router = useRouter();
  const { profileView, setProfileMode } = useContext(
    AppContext
  ) as AppContextType;

  const linkItems = [
    {
      icon: (
        <Image
          src={require('../../assets/icons/dashboard.png')}
          alt='dashboard'
          className='w-[18px] h-[18px]'
        />
      ),
      text: 'Dashboard',
      link: '/dashboard',
      needAuthentication: true,
      desktopView: true,
    },
    {
      icon: (
        <i
          className='material-icons relative top-[4px] text-imbue-purple-dark'
          aria-hidden='true'
        >
          work
        </i>
      ),
      text: 'Submit A Brief',
      link: '/briefs/new',
      needAuthentication: true,
      desktopView: false,
    },
    {
      icon: (
        <i
          className='material-icons relative top-[4px] text-imbue-purple-dark'
          aria-hidden='true'
        >
          account_balance
        </i>
      ),
      text: 'Submit A Grant',
      link: '/grants/new',
      needAuthentication: true,
      desktopView: false,
    },
    {
      icon: (
        <i
          className='material-icons relative top-[4px] text-imbue-purple-dark'
          aria-hidden='true'
        >
          search
        </i>
      ),
      text: 'Discover Briefs',
      link: '/briefs',
      needAuthentication: false,
      desktopView: false,
    },
    {
      icon: (
        <i
          className='material-icons relative top-[4px] text-imbue-purple-dark'
          aria-hidden='true'
        >
          groups
        </i>
      ),
      text: 'Discover Freelancers',
      link: `/freelancers`,
      needAuthentication: false,
      desktopView: false,
    },
    // {
    //   icon: 'person',
    //   text: 'Profile',
    //   link: `/profile/${user?.username}/`,
    //   needAuthentication: true,
    //   desktopView: false,
    // },
    // {
    //   icon: isFreelancer ? 'account_circle' : 'group_add',
    //   text: isFreelancer ? 'Freelancer Profile' : 'Join The Freelancers',
    //   link: isFreelancer
    //     ? `/freelancers/${user?.username}/`
    //     : '/freelancers/new',
    //   needAuthentication: true,
    //   desktopView: false,
    // },
    {
      icon: (
        <i
          className='material-icons relative top-[4px] text-imbue-purple-dark'
          aria-hidden='true'
        >
          money
        </i>
      ),
      text: 'Transfer Funds',
      link: '/relay',
      needAuthentication: true,
      desktopView: false,
    },
    // {
    //   icon: 'logout',
    //   text: user?.username ? 'Sign Out' : 'Sign In',
    //   link: user?.username ? '/logout' : '/login',
    //   needAuthentication: false,
    //   desktopView: false,
    // },
  ];

  const navigateToPage = async (link: string, needAuthentication: boolean) => {
    handleClose();
    if (needAuthentication && !user?.username) {
      setLoginModal(true);
    } else if (link === "/login") {
      setLoginModal(true)
    } else if (link === "/logout") {
      router.push(link);
    }
    else {
      // router.push(link);
    }
  };
  return (
    <>
      <div className='menuItems flex flex-col lg:gap-2'>
        {/* {
          linkItems.map((item, index) => (
            <MenuItem
              className={`${item.duplicate && 'lg:hidden'} ${item.needAuthentication && !user?.username && 'hidden'
                }`}
              key={index}
              onClick={() => navigateToPage(item.link, item.needAuthentication)}
            >
              {
                (item.needAuthentication && !user?.username) ||
                  item.link === '/logout' ||
                  item.link === '/login'
                  ? (
                    <div
                      className='w-full flex items-center'
                    >
                      <ListItemIcon>
                        <i
                          className='material-icons relative top-[4px] text-imbue-purple-dark'
                          aria-hidden='true'
                        >
                          {item?.icon}
                        </i>
                      </ListItemIcon>
                      <p className='text-imbue-purple-dark text-sm lg:text-base'>{item?.text}</p>
                    </div>)
                  : (
                    <Link
                      href={item.link}
                      rel="noopener noreferrer"
                    >
                      <div
                        className='w-full flex items-center'
                      >
                        <ListItemIcon>
                          <i
                            className='material-icons relative top-[4px] text-imbue-purple-dark'
                            aria-hidden='true'
                          >
                            {item?.icon}
                          </i>
                        </ListItemIcon>
                        <p className='text-imbue-purple-dark text-sm lg:text-base'>{item?.text}</p>
                      </div>
                    </Link>)
              }
            </MenuItem>
          ))
        } */}
        <div
          className='menuItems flex flex-col px-2 lg:gap-2 lg:px-4 py-[10px] lg:w-[300px]'
          onClick={() => handleClose()}
        >
          <div className='flex gap-3 items-start px-4 pb-5 border-b'>
            <Link
              href={`/profile/${user?.username}/`}
            >
              <Image
                src={user?.profile_photo ?? defaultProfile}
                width={40}
                height={40}
                alt='profile'
                className='w-7 h-7 lg:w-10 lg:h-10 rounded-full cursor-pointer'
                onClick={() => {
                  handleClose()
                  // navigateToPage(linkItems[5].link, user?.id)
                }}
              />
            </Link>

            <Link
              href={
                isFreelancer
                  ? `/freelancers/${user?.username}/`
                  : '/freelancers/new'
              }
            >
              <p>{user?.display_name || "User Name"}</p>
              <p
                className='text-xs text-content hover:underline cursor-pointer'
                onClick={() => {
                  handleClose()
                  // navigateToPage(linkItems[6].link, user?.id)
                }}
              >
                {isFreelancer ? 'Freelancer Profile' : 'Join The Freelancers'}
              </p>
            </Link>
          </div>

          <MenuItem
            className={`lg:px-4 py-2 flex items-center lg:hidden`}
            onClick={() => {
              setProfileMode(profileView == 'client' ? "freelancer" : "client");
              router.push('/dashboard');
            }}
          >
            <ListItemIcon>
              <BiBuildings color='black' size={23} />
            </ListItemIcon>
            <p className='text-imbue-purple-dark text-sm lg:text-base'>{profileView == 'client' ? "Switch to Freelancer" : "Switch to Hiring"}</p>
          </MenuItem>

          {
            linkItems.map((item, index) => (
              <Link
                href={item.link}
                key={index}
                className={`${!item.desktopView && "xl:hidden"}`}
              >
                <MenuItem
                  className={`px-4 py-2 flex items-center`}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <p className='text-imbue-purple-dark text-sm lg:text-base'>{item.text}</p>
                </MenuItem>
              </Link>
            ))
          }

          <MenuItem
            className={`px-4`}
            onClick={() => navigateToPage(user?.username ? '/logout' : '/login', user?.id)}
          >
            <ListItemIcon>
              <Image
                src={require('../../assets/icons/sign_out.png')}
                alt='dashboard'
                className='w-[18px] h-[18px]'
              />
            </ListItemIcon>
            <p className='text-imbue-coral text-sm lg:text-base'>{user?.username ? 'Sign Out' : 'Sign In'}</p>
          </MenuItem>
        </div>
      </div>
    </>)
};

export default MenuItems;
