import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withSession
} from "../../lib/middlewares"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)

handler.get(async (req, res) => {
  const user = req.session.get("user")

  if (user) return res.status(200).json({ isSignedIn: true, ...user })
  else return res.status(401).json({ isSignedIn: false })
})

handler.get(async (req, res) => {
  return res.status(200).json(req.session.get("user"))
})

export default handler
