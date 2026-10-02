import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Root HTML document. Declares the page language so search engines and screen
 * readers know the content is English.
 */
const Document = () => {
  return (
    <Html lang='en'>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
