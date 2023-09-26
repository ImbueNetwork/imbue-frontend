import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
const Layout = dynamic(() => import("@/components/Layout"));

export default function App({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>Imbue</title>
      </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
    </>
  );
}
