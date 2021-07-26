import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withSession
} from "../../lib/export"
const { OAuth2Client } = require("google-auth-library")

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_2)

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)

async function getUserData(req: ExtendedRequest) {
  if (
    !req.cookies.g_csrf_token ||
    !req.body.g_csrf_token ||
    req.cookies.g_csrf_token !== req.body.g_csrf_token
  )
    throw Error("CSRF tokens did not match.")

  const ticket = await client.verifyIdToken({
    idToken: req.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID_2
  })
  const payload = ticket.getPayload()

  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  }
}

handler.post(async (req, res) => {
  try {
    if (!req.session.get("user")) {
      req.session.set("user", await getUserData(req))
      await req.session.save()
      return res.status(200).json(req.session.get("user"))
    } else {
      return res.status(200).json(req.session.get("user"))
    }
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.get(async (req, res) => {
  return res.status(200).json(req.session.get("user"))
})

export default handler
