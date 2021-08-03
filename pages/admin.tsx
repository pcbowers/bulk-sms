import Alert from "../components/Alert"
import { useUser } from "../hooks/useUser"

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: `/?alert=You must be signed in to access this page&alertType=error`
  })

  if (!user) return <div>Loading</div>
  if (!user?.isSignedIn) return <div>Forbidden</div>

  return (
    <>
      <Alert displayLength={20000000} alert="Welcome" />
    </>
  )
}
