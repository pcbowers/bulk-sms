import { getSession } from "next-auth/client"

export const withUserAuthentication = (handler, exceptMethods = []) => {
  return async (req, res) => {
    //get session
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

    // return handler
    return handler(req, res)
  }
}
