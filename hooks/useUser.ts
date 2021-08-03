import { useRouter } from "next/router"
import { useEffect } from "react"
import useSWR from "swr"

export interface UserData {
  isSignedIn: boolean
  name: string
  email: string
  picture: string
}

export function useUser({
  redirectTo = false,
  redirectIfFound = false
}: {
  redirectTo?: boolean | string
  redirectIfFound?: boolean
} = {}) {
  const router = useRouter()
  const { data: user, mutate: mutateUser } = useSWR<UserData>("/api/user")

  useEffect(() => {
    if (!redirectTo || !user) return

    if (
      typeof redirectTo === "string" &&
      ((!redirectIfFound && !user?.isSignedIn) ||
        (redirectIfFound && user?.isSignedIn))
    )
      router.push(redirectTo)
  }, [user, redirectIfFound, redirectTo])

  return { user, mutateUser }
}
