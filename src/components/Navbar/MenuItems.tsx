import { ListItemIcon, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

const MenuItems = ({ user, isFreelancer, setLoginModal, handleClose }: any) => {
  const router = useRouter();

  const linkItems = [
    {
      icon: 'face',
      text: 'Dashboard',
      link: '/dashboard',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'work',
      text: 'Submit A Brief',
      link: '/briefs/new',
      needAuthentication: true,
      duplicate: true,
    },
    {
      icon: 'account_balance',
      text: 'Submit A Grant',
      link: '/briefs/new',
      needAuthentication: true,
      duplicate: true,
    },
    {
      icon: 'search',
      text: 'Discover Briefs',
      link: '/briefs',
      needAuthentication: false,
      duplicate: true,
    },
    {
      icon: 'groups',
      text: 'Discover Freelancers',
      link: `/freelancers`,
      needAuthentication: false,
      duplicate: true,
    },
    {
      icon: 'person',
      text: 'Profile',
      link: `/profile/${user?.username}/`,
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: isFreelancer ? 'account_circle' : 'group_add',
      text: isFreelancer ? 'Freelancer Profile' : 'Join The Freelancers',
      link: isFreelancer
        ? `/freelancers/${user?.username}/`
        : '/freelancers/new',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'money',
      text: 'Transfer Funds',
      link: '/relay',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'logout',
      text: user?.username ? 'Sign Out' : 'Sign In',
      link: user?.username ? '/logout' : '/login',
      needAuthentication: false,
      duplicate: false,
    },
  ];

  const navigateToPage = async (link: string, needAuthentication: boolean) => {
    handleClose();
    if (needAuthentication && !user?.username) {
      setLoginModal(true);
    } else if (link === '/login') {
      setLoginModal(true);
    } else {
      router.push(link);
    }
  };
  return (
    <>
      <div className='menuItems flex flex-col lg:gap-2'>
        {linkItems.map((item, index) => (
          <MenuItem
            className={`${item.duplicate && 'lg:hidden'} ${
              item.needAuthentication && !user?.username && 'hidden'
            }`}
            key={index}
            onClick={() => {
              navigateToPage(item.link, item.needAuthentication);
              if (item.link === '/logout') {
                localStorage.clear();
              }
            }}
          >
            <ListItemIcon>
              <i
                className='material-icons relative top-[4px] text-imbue-purple-dark'
                aria-hidden='true'
              >
                {item?.icon}
              </i>
            </ListItemIcon>
            <p className='text-imbue-purple-dark text-sm lg:text-base'>
              {item?.text}
            </p>
          </MenuItem>
        ))}
      </div>
    </>
  );
};

export default MenuItems;
