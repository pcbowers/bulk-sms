import Head from "next/head"
import { useUser } from "../hooks/useUser"

export default function Home() {
  const { user, mutateUser } = useUser({
    redirectTo: `/admin?alert=You are already signed in. Redirecting you to the admin page&alertType=warning`,
    redirectIfFound: true
  })
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  )
}
