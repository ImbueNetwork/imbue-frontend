import { createTheme, ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import React, { createContext } from 'react';
import { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar';

import { Providers } from '@/redux/providers/userProviders';

import ErrorScreen from './ErrorScreen';
import LoginPopup from './LoginPopup/LoginPopup';
import NewNavbar from './Navbar/NewNavBar';

type LayoutProps = {
  children: React.ReactNode;
};

export interface LoginPopupStateType {
  open: boolean;
  redirectURL?: string;
}

// export interface LoginPopupContextType {
//   showLoginPopUp?: LoginPopupStateType;
//   setShowLoginPopup: (_value: LoginPopupStateType) => void;
// }

// export const LoginPopupContext = createContext<LoginPopupContextType | null>(
//   null
// );

type ProfileMode = 'client' | 'freelancer';

export interface AppContextType {
  profileView?: ProfileMode;
  setProfileMode: (_mode: ProfileMode) => void;
  setError: (_error: any) => void;
  showLoginPopUp?: LoginPopupStateType;
  setShowLoginPopup: (_value: LoginPopupStateType) => void;
}

// TODO: Include screens to this context
export const AppContext = createContext<AppContextType | null>(
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

  // Profile switching 
  const [profileView, setProfileView] = useState<ProfileMode>('client');
  const [error, setError] = useState<any>();


  useEffect(() => {
    const profileView = localStorage.getItem('profileView') as ProfileMode;

    if (profileView) setProfileView(profileView);
  }, []);

  const setProfileMode = (mode: ProfileMode) => {
    localStorage.setItem('profileView', mode);
    setProfileView(mode);
  };

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
            <AppContext.Provider
              value={{
                profileView,
                setProfileMode,
                setError,
                setShowLoginPopup,
                showLoginPopUp
              }}
            >
              {!(
                router.asPath === '/join' ||
                router.asPath === '/auth/sign-up' ||
                router.asPath === '/auth/sign-in'
              ) && <NewNavbar />}

              <main
                className={`padded lg:!px-[var(--hq-layout-padding)] !pt-[120px]`}
                id='main-content'
              >
                {children}
              </main>
              <LoginPopup
                visible={showLoginPopUp?.open}
                setVisible={setShowLoginPopup}
                redirectUrl={showLoginPopUp.redirectURL}
              />
              <ErrorScreen {...{ error, setError }}>
                <div className='flex flex-col gap-4 w-1/2'>
                  <button
                    onClick={() => window.location.reload()}
                    className='primary-btn in-dark w-button w-full !m-0'
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard`)}
                    className='underline text-xs lg:text-base font-bold'
                  >
                    Go to Dashboard
                  </button>
                </div>
              </ErrorScreen>
            </AppContext.Provider>
          </Providers>
        </React.Fragment>
      </StyledEngineProvider>
    </ThemeProvider>
  );
}

export default Layout;
