import twilio from "twilio"

export const withTwilioAuthentication = (handler, exceptMethods = []) => {
  return async (req, res) => {
    //get session
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
        .json(JSON.stringify({ error: "user unauthorized" }))

    // return handler
    return handler(req, res)
  }
}
