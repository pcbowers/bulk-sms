import nextConnect from "next-connect"
import {
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryArray,
  withSession,
  withUserAuthentication
} from "../../lib/export"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(withQueryArray)

handler.get(async (req, res) => {
  return res.status(200).json(req.query)
})

export default handler
