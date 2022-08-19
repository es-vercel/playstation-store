import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=optional"
            rel="stylesheet"
          ></link>
        </Head>
        <body className="loading">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
