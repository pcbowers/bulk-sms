import { OAuth2Client } from "google-auth-library"
import nextConnect from "next-connect"
import { GOOGLE_CLIENT_ID } from "../../lib/config"
import {
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withSession
} from "../../lib/middlewares"
import { contact } from "../../lib/models"
const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)
handler.use(withDatabase)

async function getUserData(req: ExtendedRequest) {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID)

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
  if (!payload) throw Error("User Not Found")
  const potentialAdmin = await contact.get.one.query({ email: payload.email })()
  if (potentialAdmin === null || !potentialAdmin.admin)
    throw Error("Not Authorized")

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
        `/admin?alert=Successfuly Logged In&alertType=success`
      )
    } else {
      return res.redirect(`/admin?alert=Already Logged In`)
    }
  } catch (error) {
    return res.redirect(`/?alert=${error.message}&alertType=error`)
  }
})

handler.get(async (req, res) => {
  return res.status(200).json(req.session.get("user"))
})

export default handler
