import { appLogo } from "@/assets/svgs";
import Image from "next/image";
import React, { useState } from "react";
import Drawer from "./drawer";
import FullScreenLoader from "./fullScreenLoader";

function Navbar() {
  const [sideBarIsVisivle, setSideBarIsVisible] = useState<boolean>(false);

  const toggleSideBar = (): void => {
    setSideBarIsVisible(!sideBarIsVisivle);
  };
  return (
    <>
      <header className="padded" id="header-wrapper">
        <div id="main-header">
          <h1 className="main-title">
            <a href="">
              <div id="logo">
                <Image
                  src={appLogo}
                  alt={"app logo"}
                  priority
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </a>
          </h1>
          <div className="spacer" />
          <div className="context-menu" id="context-menu">
            <div className="context-menu-item" onClick={toggleSideBar}>
              <a id="main-menu" className="material-icons">
                &#xe5d2;
              </a>
            </div>
          </div>
        </div>
      </header>
      <div
        onClick={toggleSideBar}
        className={`modal ${sideBarIsVisivle ? "show" : ""}`}
        id="modal"
      />
      <Drawer visible={sideBarIsVisivle} toggleVisibility={toggleSideBar} />
      <FullScreenLoader />
    </>
  );
}

export default Navbar;
