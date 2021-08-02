import nextConnect from "next-connect"
import { GOOGLE_CLIENT_ID } from "../../lib/config"
import {
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withSession
} from "../../lib/middlewares"
import { contact } from "../../lib/models"
const { OAuth2Client } = require("google-auth-library")

const client = new OAuth2Client(GOOGLE_CLIENT_ID)

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)
handler.use(withDatabase)

async function getUserData(req: ExtendedRequest) {
  if (
    !req.cookies.g_csrf_token ||
    !req.body.g_csrf_token ||
    req.cookies.g_csrf_token !== req.body.g_csrf_token
  )
    throw Error("CSRF tokens did not match.")

  const ticket = await client.verifyIdToken({
    idToken: req.body.credential,
    audience: GOOGLE_CLIENT_ID
  })

  const payload = ticket.getPayload()

  const potentialAdmin = await contact.get.one.query({ email: payload.email })()

  if (potentialAdmin === null || !potentialAdmin.admin)
    throw Error("not authorized.")

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
      return res.redirect(
        `/admin?redirect=${encodeURI("successfuly logged in")}`
      )
    } else {
      return res.redirect(`/admin?redirect=${encodeURI("already logged in")}`)
    }
  } catch (error) {
    return res.redirect(`/?redirect=${encodeURI(error.message)}`)
  }
})

handler.get(async (req, res) => {
  return res.status(200).json(req.session.get("user"))
})

export default handler
