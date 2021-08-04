import Head from "next/head"
import { useUser } from "../hooks/useUser"

export default function Home() {
  const { user, mutateUser } = useUser({
    redirectTo: `/admin?alert=You are already signed in. Redirecting you to the admin page&alertType=warning`,
    redirectIfFound: true
  })
  return (
    <>
      <Head>
        <title>Bulk SMS - Home</title>
      </Head>
    </>
  )
}
