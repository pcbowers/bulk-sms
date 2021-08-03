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
    res.redirect(302, `/?alert=Sign Out Successful&alertType=success`)
  } catch (error) {
    res.redirect(302, `/?alert=Sign Out Failed&alertType=error`)
  }
})

export default handler
