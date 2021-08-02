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
          <div
            className="fixed flex flex-col gap-2 left-5 right-5 bottom-3"
            id="alerts"
          ></div>
        </body>
      </Html>
    )
  }
}

export default MyDocument
