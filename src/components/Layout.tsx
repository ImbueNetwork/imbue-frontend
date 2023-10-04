import { createTheme, ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import React, { createContext } from 'react';
import { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar';
import '@/styles/common.css';
import '@/styles/globals.css';
import '@/styles/index.css';
import '@/styles/proposal.css';
import '@/styles/briefs.css';
import '@/styles/new-brief.css';
import '@/styles/brief-details.css';
import '@/styles/submit-proposal.css';
import '@/styles/muiGlobal.css';
import '@/styles/stream-chat.css';
import '@/styles/animation.css';

import { Providers } from '@/redux/providers/userProviders';

import LoginPopup from './LoginPopup/LoginPopup';
import NewNavbar from './Navbar/NewNavBar';

type LayoutProps = {
  children: React.ReactNode;
};

export interface LoginPopupStateType {
  open: boolean;
  redirectURL?: string;
}

export interface LoginPopupContextType {
  showLoginPopUp?: LoginPopupStateType;
  setShowLoginPopup: (_value: LoginPopupStateType) => void;
}

export const LoginPopupContext = createContext<LoginPopupContextType | null>(
  null
);

function Layout({ children }: LayoutProps) {
  const [progress, setProgress] = useState(0);
  const [showLoginPopUp, setShowLoginPopup] = useState<LoginPopupStateType>({
    open: false,
  });
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => setProgress(35));
    router.events.on('routeChangeComplete', () => setProgress(100));
    router.events.on('routeChangeError', () => setProgress(100));

    return () => {
      router.events.off('routeChangeStart', () => setProgress(35));
      router.events.off('routeChangeComplete', () => setProgress(100));
      router.events.off('routeChangeError', () => setProgress(100));
    };
  }, [router]);
  const theme = createTheme({
    palette: {
      primary: {
        main: '#b2ff0b',
      },
      secondary: {
        main: '#3B27C1',
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <StyledEngineProvider injectFirst>
        <React.Fragment>
          {progress > 0 && (
            <LoadingBar
              color='#b2ff0b'
              progress={progress}
              onLoaderFinished={() => setProgress(0)}
              waitingTime={200}
            />
          )}
          <Providers>
            {!(
              router.asPath === '/join' ||
              router.asPath === '/auth/sign-up' ||
              router.asPath === '/auth/sign-in'
            ) && <NewNavbar />}

            <main
              className={`padded lg:!px-[var(--hq-layout-padding)] !pt-[100px]`}
              id='main-content'
            >
              <LoginPopupContext.Provider
                value={{ showLoginPopUp, setShowLoginPopup }}
              >
                {children}
              </LoginPopupContext.Provider>
            </main>
            <LoginPopup
              visible={showLoginPopUp?.open}
              setVisible={setShowLoginPopup}
              redirectUrl={showLoginPopUp.redirectURL}
            />
          </Providers>
        </React.Fragment>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

export default Layout;
