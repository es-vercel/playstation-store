import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body className="loading">
          <Main />
          <NextScript />
          <Script
            src="https://cdn.html.games.alexa.a2z.com/alexa-html/latest/alexa-html.js"
            strategy="beforeInteractive"
          ></Script>
        </body>
      </Html>
    )
  }
}

export default MyDocument
