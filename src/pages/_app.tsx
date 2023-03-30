import type { AppProps } from "next/app";
import Layout from "@/components/layout";
import "@/styles/globals.css";
import "@/styles/common.css";
import "@/styles/index.css";
import "@/styles/proposal.css";
import "@/styles/proposals.css";
import "@/styles/proposal-draft.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
