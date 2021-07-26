import Document, { Head, Html, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <script src="theme.js" />
          <script
            src="https://accounts.google.com/gsi/client"
            async
            defer
          ></script>
          <div
            id="g_id_onload"
            data-client_id={process.env.GOOGLE_CLIENT_ID_2}
            data-login_uri={`${process.env.NEXTAUTH_URL}/api/signin`}
            data-auto_prompt="false"
          ></div>
          <div
            className="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="circle"
            data-width="250"
          ></div>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
