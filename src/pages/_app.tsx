import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
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
