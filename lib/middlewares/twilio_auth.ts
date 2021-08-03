import { Middleware } from "next-connect"
import twilio from "twilio"
import { CURRENT_URL, TWILIO_AUTH_TOKEN } from "../config"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"

export const withTwilioAuthentication =
  (
    excludedMethods: string[] = []
  ): Middleware<ExtendedRequest, ExtendedResponse> =>
  async (req, res, next) => {
    const validation = await twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      String(req.headers["x-twilio-signature"]),
      CURRENT_URL + req.url,
      req.body
    )

    excludedMethods = excludedMethods.map((method) => method.toLowerCase())

    if (
      // validation did not pass
      !validation &&
      // we are not on our localhost server
      CURRENT_URL !== "http://localhost:3000" &&
      // method is not excluded
      !excludedMethods.includes((req.method || "").toLowerCase())
    )
      return res.status(401).json(JSON.stringify({ error: "unauthorized" }))

    next()
  }
