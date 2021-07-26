import { NextApiRequest, NextApiResponse } from "next"
import { Middleware } from "next-connect"
import { Session } from "next-iron-session"

interface ExtendedRequest extends NextApiRequest {
  session: Session
}

export const withUserAuthentication: Middleware<
  ExtendedRequest,
  NextApiResponse
> = async (req, res, next) => {
  const user = req.session.get("user")

  if (
    // session does not exist
    !user &&
    // we are not on our localhost server
    process.env.NEXTAUTH_URL !== "http://localhost:3000"
  )
    return res.status(401).json(JSON.stringify({ error: "user unauthorized" }))

  next()
}
