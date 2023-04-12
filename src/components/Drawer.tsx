import React, { useState } from "react";
import Login from "./Login";
import { getCurrentUser } from "@/utils";
import { useRouter } from "next/router";

type DrawerProps = {
  visible: boolean;
  toggleVisibility: () => void;
};

const Drawer = ({ visible, toggleVisibility }: DrawerProps): JSX.Element => {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const linkItems = [
    {
      icon: "face",
      text: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: "group_add",
      text: "Join The Freelancers",
      link: "/freelancer",
    },
    {
      icon: "work",
      text: "Submit A Brief",
      link: "/briefs/new",
    },
    {
      icon: "search",
      text: "Discover Briefs",
      link: "/briefs",
    },
    {
      icon: "money",
      text: "Transfer Funds",
      link: "/relay",
    },
    {
      icon: "logout",
      text: "Log out",
      link: "",
    },
  ];

  const navigateToPage = async (link: string) => {
    const userResponse = await getCurrentUser();
    if (userResponse) {
      router.push(link);
      toggleVisibility();
    } else {
      setLoginModal(true);
    }
  };
  return (
    <div className={`drawer ${visible ? "open" : ""}`} id="right-drawer">
      <nav id="nav">
        <ul id="menu">
          {linkItems.map((item, index: number) => {
            return (
              <li
                key={`drawer-item-${index}`}
                className="menu-item"
                id="menu-item__account-dashboard"
              >
                <p
                  className="text-white dlex py-[12px] px-[20px]"
                  title={item?.text}
                  onClick={() => navigateToPage(item.link)}
                >
                  <i
                    className="material-icons relative top-[4px]"
                    aria-hidden="true"
                  >
                    {item?.icon}
                  </i>
                  <span>{item?.text}</span>
                </p>
              </li>
            );
          })}
        </ul>
      </nav>
      <Login
        visible={loginModal}
        setVisible={setLoginModal}
        redirectUrl="/dashboard"
      />
    </div>
  );
};

export default Drawer;
