import type { AppProps } from "next/app";
import Layout from "@/components/layout";
import "@/styles/globals.css";
import "@/styles/common.css";
import "@/styles/index.css";
import "@/styles/proposal.css";
import "@/styles/proposals.css";
import "@/styles/proposal-draft.css";
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
