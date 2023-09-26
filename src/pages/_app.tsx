import { createTheme, ThemeProvider } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
const Layout = dynamic(() => import("@/components/Layout"));

export default function App({ Component, pageProps }: AppProps) {
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
    <>
      <Head>
        <title>Imbue</title>
      </Head>
      <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </StyledEngineProvider>
      </ThemeProvider>
    </>
  );
}
