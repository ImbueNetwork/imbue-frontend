import React from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <React.Fragment>
      <Navbar />
      <main className="padded" id="main-content">
        {children}
      </main>
    </React.Fragment>
  );
}

export default Layout;
