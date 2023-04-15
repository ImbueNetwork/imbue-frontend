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
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [redirectURL, setRedirectURL] = useState<string>()

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
      text: authenticated ? "Sign Out" : "Sign In",
      link: "/logout",
    },
  ];

  const navigateToPage = async (link: string) => {
    const storedObject = localStorage.getItem("userAuth");
    if (storedObject) {
      const parsedData = JSON.parse(storedObject);
      const isAuthenticated = parsedData?.isAuthenticated || false;
      setAuthenticated(isAuthenticated);
      if (isAuthenticated && link !== "/logout") {
        router.push(link);
        toggleVisibility();
      } else if (link === "/logout") {
        await localStorage.clear();
        router.push(link);
        toggleVisibility();
      }
    } else {
      link !== "/logout" && setRedirectURL(link)
      setLoginModal(true);
    }
  };
  return (
    <>
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
      </div>
      <Login
        visible={loginModal}
        setVisible={(val) => {
          setLoginModal(val);
          toggleVisibility();
        }}
        redirectUrl={redirectURL || "/dashboard"}
      />
    </>
  );
};

export default Drawer;
