import twilio from "twilio"

const authenticateTwilio = async (req, res, exceptMethods = []) => {
  const validation = await twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    req.headers["x-twilio-signature"],
    process.env.NEXTAUTH_URL + req.url,
    req.body
  )

  if (
    // validation did not pass
    !validation &&
    // we are not on our localhost server
    process.env.NEXTAUTH_URL !== "http://localhost:3000" &&
    // the method used requires authentication
    !exceptMethods.includes(req.method)
  )
    return res
      .status(401)
      .json(JSON.stringify({ error: "unauthorized" }))
      .end()

  return
}

export const withTwilioAuthentication = (handler) => async (req, res) => {
  res.authenticateTwilio = async (exceptMethods) =>
    await authenticateTwilio(req, res, exceptMethods)

  return handler(req, res)
}
