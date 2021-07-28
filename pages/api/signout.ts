import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withSession
} from "../../lib/export"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)

handler.get(async (req, res) => {
  try {
    req.session.destroy()
    res.status(200).json({ body: "logged out successfully" })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default handler