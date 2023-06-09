import { Head, Html, Main, NextScript } from 'next/document';

export default function Document(): JSX.Element {
  return (
    <Html lang='en'>
      <Head>
        <link
          href='https://fonts.googleapis.com/css?family=Material+Icons&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <div id='layout'>
          <Main />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}
