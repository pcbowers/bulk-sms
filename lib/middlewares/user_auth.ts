import { Middleware } from "next-connect"
import { CURRENT_URL } from "../config"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"

export const withUserAuthentication =
  (
    excludedMethods: string[] = []
  ): Middleware<ExtendedRequest, ExtendedResponse> =>
  async (req, res, next) => {
    const user = req.session.get("user")

    excludedMethods = excludedMethods.map((method) => method.toLowerCase())

    if (
      // session does not exist
      !user &&
      // we are not on our localhost server
      CURRENT_URL !== "http://localhost:3000" &&
      // method is not excluded
      !excludedMethods.includes(req.method || "")
    )
      return res
        .status(401)
        .json(JSON.stringify({ error: "user unauthorized" }))

    req.user = user

    next()
  }
