import Head from "next/head"
import { useUser } from "../hooks/useUser"

export default function Contacts() {
  const { user, mutateUser } = useUser({
    redirectTo: `/?alert=You must be signed in to access this page&alertType=error`
  })

  if (!user) return <div>Loading</div>
  if (!user?.isSignedIn) return <div>Forbidden</div>

  return (
    <>
      <Head>
        <title>Bulk SMS - Contacts</title>
      </Head>
    </>
  )
}
