import nextConnect from "next-connect"
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/middlewares"
import { text } from "../../lib/models"

interface ExtendedParams {}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(withQueryCleanse<ExtendedParams>({}))

handler.get(async (req, res) => {
  let data: MessageInstance

  try {
    data = await text.get.one("SMa15e76a754f9c4b3009779ba81f33c9f")
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
