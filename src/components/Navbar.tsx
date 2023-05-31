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

const logoStyle = { height: "100%", width: "100%" };

function Navbar() {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [redirectURL, setRedirectURL] = useState<string>();
  const [freelancerProfile, setFreelancerProfile] = useState<any>()
  const [user, setUser] = useState<User>()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
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


  return (
    <>
      <header className="py-3 navBar" id="header-wrapper">
        <div id="main-header" className="flex justify-between">
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
            <Typography sx={{ minWidth: 100 }}>Contact</Typography>
            <Typography sx={{ minWidth: 100 }}>Profile</Typography>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ width: 40, height: 40 }}>
                  <Image src={freelancerProfile?.profile_image || defaultProfile} width={40} height={40} alt="profile" />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </div>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          className="navBar"
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              bgcolor: "#0F0F0F",
              color: "white",
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: '#0F0F0F',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItems
            isFreelancer={freelancerProfile?.id ? true : false}
            {...{ user, setLoginModal }}
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
