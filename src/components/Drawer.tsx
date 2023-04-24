import React, { useEffect, useState } from "react";
import Login from "./Login";
import { useRouter } from "next/router";
import { freelancerExists } from "@/redux/services/freelancerService";
import { User } from "@/model";

type DrawerProps = {
  visible: boolean;
  toggleVisibility: () => void;
};

const Drawer = ({ visible, toggleVisibility }: DrawerProps): JSX.Element => {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [redirectURL, setRedirectURL] = useState<string>();
  const [isFreelancer, setIsFreelancer] = useState<any>(false)
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const findFreelancer = async (user: any) => {
      if (user) {
        setIsFreelancer(await freelancerExists(user?.username));
      }
    };

    const storedObject = localStorage.getItem("userAuth");
    if (storedObject) {
      const parsedData = JSON.parse(storedObject);
      findFreelancer(parsedData.user);
      setUser(parsedData.user);
      const isAuthenticated = parsedData?.isAuthenticated || false;
      setAuthenticated(isAuthenticated);
    }
  }, [visible]);

  const linkItems = [
    {
      icon: "face",
      text: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: "group_add",
      text: isFreelancer ? "Freelancer Profile" : "Join The Freelancers",
      link: isFreelancer ? `/freelancers/${user?.username}/` : "/freelancers/new",
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
      link: authenticated ? "/logout" : "",
    },
  ];

  const navigateToPage = async (link: string) => {
    if (authenticated && link !== "/logout" && link !== "") {
      router.push(link);
      toggleVisibility();
    } else if (link === "/logout") {
      await localStorage.clear();
      router.push(link);
      toggleVisibility();
    } else {
      link !== "/logout" && link !== "" && setRedirectURL(link);
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
