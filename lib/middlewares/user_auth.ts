import { Middleware } from "next-connect"
import { CURRENT_URL } from "../config"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"

export const withUserAuthentication: Middleware<
  ExtendedRequest,
  ExtendedResponse
> = async (req, res, next) => {
  const user = req.session.get("user")

  if (
    // session does not exist
    !user &&
    // we are not on our localhost server
    CURRENT_URL !== "http://localhost:3000"
  )
    return res.status(401).json(JSON.stringify({ error: "user unauthorized" }))

  req.user = user

  next()
}
