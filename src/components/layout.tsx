import React from "react";
import Navbar from "./navbar";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Navbar />
      <main className="padded" id="content-root">
        {children}
      </main>
    </div>
  );
}

export default Layout;
