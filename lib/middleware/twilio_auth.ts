import { NextApiRequest, NextApiResponse } from "next"
import { Middleware } from "next-connect"
import twilio from "twilio"

export const withTwilioAuthentication: Middleware<
  NextApiRequest,
  NextApiResponse
> = async (req, res, next) => {
  const validation = await twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN || "",
    String(req.headers["x-twilio-signature"]),
    process.env.NEXTAUTH_URL || "" + req.url,
    req.body
  )

  if (
    // validation did not pass
    !validation &&
    // we are not on our localhost server
    process.env.NEXTAUTH_URL !== "http://localhost:3000"
  )
    return res.status(401).json(JSON.stringify({ error: "unauthorized" }))

  next()
}
