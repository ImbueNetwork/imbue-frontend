import type { AppProps } from "next/app";
import Layout from "@/components/layout";
import "@/styles/globals.css";
import "@/styles/index.css";
import "material-components-web/dist/material-components-web.min.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
