import { Middleware } from "next-connect"
import twilio from "twilio"
import { CURRENT_URL, TWILIO_AUTH_TOKEN } from "../config"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"

export const withTwilioAuthentication: Middleware<
  ExtendedRequest,
  ExtendedResponse
> = async (req, res, next) => {
  const validation = await twilio.validateRequest(
    TWILIO_AUTH_TOKEN,
    String(req.headers["x-twilio-signature"]),
    CURRENT_URL + req.url,
    req.body
  )

  if (
    // validation did not pass
    !validation &&
    // we are not on our localhost server
    CURRENT_URL !== "http://localhost:3000"
  )
    return res.status(401).json(JSON.stringify({ error: "unauthorized" }))

  next()
}
