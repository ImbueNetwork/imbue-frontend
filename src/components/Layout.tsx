import React from "react";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LoadingBar from "react-top-loading-bar";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    router.events.on("routeChangeStart", () => setProgress(35))
    router.events.on("routeChangeComplete", () => setProgress(100))
    router.events.on("routeChangeError", () => setProgress(100))

    return () => {
      router.events.off("routeChangeStart", () => setProgress(35))
      router.events.off("routeChangeComplete", () => setProgress(100))
      router.events.off("routeChangeError", () => setProgress(100))
    }

  }, [router])
  return (
    <React.Fragment>
      {progress > 0 && <LoadingBar
        color='#b2ff0b'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
        waitingTime={200}
      />}
      <Navbar />
      <main className={`padded lg:!px-[var(--hq-layout-padding)] !pt-32`} id="main-content">
        {children}
      </main>
    </React.Fragment>
  );
}

export default Layout;
