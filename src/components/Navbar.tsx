import { appLogo } from "@/assets/svgs";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Drawer from "@/components/Drawer";
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { getCurrentUser } from "@/utils";
import { User } from "@/model";
import { freelancerExists } from "@/redux/services/freelancerService";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import defaultProfile from "../assets/images/profile-image.png"
import MenuItems from "./Navbar/MenuItems";
import Login from "./Login";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const logoStyle = { height: "100%", width: "100%" };

function Navbar() {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [redirectURL, setRedirectURL] = useState<string>();
  const [freelancerProfile, setFreelancerProfile] = useState<any>()
  const [user, setUser] = useState<User>()

  const [solidNav, setSolidNav] = useState<boolean>(false)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openMenu, setOpenMenu] = useState(false)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(Boolean(event.currentTarget))
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false)
  };

  useEffect(() => {
    const setup = async () => {
      const user = await getCurrentUser() || false;
      if (user) {
        const res = await getFreelancerProfile(user.username)
        setFreelancerProfile(res);
        setUser(user);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50

      if (isScrolled) setSolidNav(true)
      else setSolidNav(false)
    }

    document.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])




  return (
    <>
      <header className={`navBar ${solidNav ? "bg-theme-black-text" : "bg-transparent"}`} id="header-wrapper">
        <div className="text-center w-full bg-primary text-black py-1 text-xs lg:text-sm">
          Thanks for trying the beta version of Imbue. Please let us know what we should work on to make it better! Submit your feedback
          <a href="https://pfljr3ser45.typeform.com/to/bv00pviH" target="_blank" className="underline cursor-pointer ml-1">here</a>
        </div>
        <div id="main-header" className="flex justify-between !py-2">
          <h1 className="main-title">
            <Link href="/">
              <div id="logo">
                <Image src={appLogo} alt={"app logo"} style={logoStyle} />
              </div>
            </Link>
          </h1>
          {/* <div className="context-menu" id="context-menu">
            <div className="context-menu-item" onClick={toggleSideBar}>
              <a id="main-menu" className="material-icons">
                &#xe5d2;
              </a>
            </div>
          </div> */}

          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
            <Typography className="mx-1 lg:mx-5 text-xs lg:text-sm" sx={{ minWidth: 100 }}>Start a Project</Typography>
            <Typography className="mx-1 lg:mx-5 text-xs lg:text-sm" sx={{ minWidth: 100 }}>Fund a Project</Typography>
            <Typography className="mx-1 lg:mx-5 text-xs lg:text-sm" sx={{ minWidth: 100 }}>Why Imbue?</Typography>
            <Typography className="mx-1 lg:mx-5 text-xs lg:text-sm" sx={{ minWidth: 100 }}>Find a Team</Typography>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                {
                  user?.id
                    ? <Avatar sx={{ width: 40, height: 40 }}>
                      <Image src={freelancerProfile?.profile_image || defaultProfile} width={40} height={40} alt="profile" />
                    </Avatar>
                    : <div onClick={() => setOpenMenu(!openMenu)}>
                      {
                        openMenu
                          ? <CloseIcon htmlColor="white" />
                          : <MenuIcon htmlColor="white" />
                      }
                    </div>
                }

              </IconButton>
            </Tooltip>
          </Box>
        </div>
        <Menu
          disableScrollLock={true}
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          className="navBar"
        >
          <MenuItems
            isFreelancer={freelancerProfile?.id ? true : false}
            {...{ user, setLoginModal, handleClose }}
          />
        </Menu>
      </header>
      <Login
        visible={loginModal}
        setVisible={(val) => {
          console.log("object");
          setLoginModal(val);
        }}
        redirectUrl={redirectURL || "/dashboard"}
      />
    </>
  );
}

export default Navbar;
