import Document, { Head, Html, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <script src="theme.js" />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
