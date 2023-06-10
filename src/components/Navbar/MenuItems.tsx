import { ListItemIcon, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Login from '../Login';


const MenuItems = ({ user, isFreelancer, setLoginModal, handleClose }: any) => {
    const router = useRouter();
    const [redirectURL, setRedirectURL] = useState<string>();

    const linkItems = [
        {
            icon: "face",
            text: "Dashboard",
            link: "/dashboard",
            needAuthentication: true,
            duplicate: false,
        },
        {
            icon: "work",
            text: "Submit A Brief",
            link: "/briefs/new",
            needAuthentication: true,
            duplicate: true,
        },
        {
            icon: "search",
            text: "Discover Briefs",
            link: "/briefs",
            needAuthentication: false,
            duplicate: true,
        },
        {
            icon: "groups",
            text: "Discover Freelancers",
            link: `/freelancers`,
            needAuthentication: false,
            duplicate: true,
        },
        {
            icon: "person",
            text: "Profile",
            link: `/profile/${user?.id}/`,
            needAuthentication: false,
            duplicate: false,
        },
        {
            icon: isFreelancer ? "account_circle" : "group_add",
            text: isFreelancer ? "Freelancer Profile" : "Join The Freelancers",
            link: isFreelancer ? `/freelancers/${user?.username}/` : "/freelancers/new",
            needAuthentication: true,
            duplicate: false,
        },
        
        {
            icon: "money",
            text: "Transfer Funds",
            link: "/relay",
            needAuthentication: false,
            duplicate: false,
        },
        {
            icon: "logout",
            text: user?.username ? "Sign Out" : "Sign In",
            link: user?.username ? "/logout" : "/login",
            needAuthentication: true,
            duplicate: false,
        },
    ];

    const navigateToPage = async (link: string, needAuthentication: boolean) => {
        handleClose()
        if (needAuthentication && !user?.username) {
            setRedirectURL(router.asPath)
            setLoginModal(true);
        }
        else {
            router.push(link);
        }
    };
    return (
        <>
            <div className='menuItems flex flex-col gap-2'>
                {
                    linkItems.map((item, index) => (
                        <MenuItem className={`${item.duplicate && "lg:hidden"}`} key={index} onClick={() => navigateToPage(item.link, item.needAuthentication)}>
                            <ListItemIcon>
                                <i
                                    className="material-icons relative top-[4px] text-white"
                                    aria-hidden="true"
                                >
                                    {item?.icon}
                                </i>
                            </ListItemIcon>
                            <p>
                                {item?.text}
                            </p>
                        </MenuItem>
                    ))
                }
            </div>
        </>
    );
};

export default MenuItems;