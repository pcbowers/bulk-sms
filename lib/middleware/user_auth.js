import { getSession } from "next-auth/client"

const authenticateUser = async (req, res, exceptMethods = []) => {
  const session = await getSession({ req })

  if (
    // session does not exist
    !session &&
    // we are not on our localhost server
    process.env.NEXTAUTH_URL !== "http://localhost:3000" &&
    // the method used requires authentication
    !exceptMethods.includes(req.method)
  )
    return res
      .status(401)
      .json(JSON.stringify({ error: "user unauthorized" }))
      .end()
}

export const withUserAuthentication = (handler) => async (req, res) => {
  res.authenticateUser = async (exceptMethods) =>
    await authenticateUser(req, res, exceptMethods)

  return handler(req, res)
}
