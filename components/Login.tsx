import { useEffect } from "react"
import { CURRENT_URL, GOOGLE_CLIENT_ID } from "../lib/config"

export default function Login() {
  useEffect(() => {
    const script = document.createElement("script")

    script.src = "https://accounts.google.com/gsi/client"
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <div
        id="g_id_onload"
        data-client_id={GOOGLE_CLIENT_ID}
        data-login_uri={`${CURRENT_URL}/api/signin`}
        data-auto_prompt="false"
      />
      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="signin"
        data-shape="circle"
        data-width="50"
      />
    </>
  )
}
