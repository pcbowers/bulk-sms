import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withSession
} from "../../lib/middlewares"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)

handler.get(async (req, res) => {
  try {
    req.session.destroy()
    res.redirect(`/?redirect=${encodeURI("sign out successful")}`)
  } catch (error) {
    res.redirect(`/?redirect=${encodeURI("sign out failed")}`)
  }
})

export default handler
