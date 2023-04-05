import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import "@/styles/common.css";
import "@/styles/globals.css";
import "@/styles/index.css";
import "@/styles/proposal.css";
import "@/styles/briefs.css";
import "@/styles/new-brief.css";
import "@/styles/brief-details.css";
import "@/styles/submit-proposal.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
