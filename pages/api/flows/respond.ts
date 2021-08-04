import nextConnect from "next-connect"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withTwilioAuthentication
} from "../../../lib/middlewares"
import { text } from "../../../lib/models"

interface ExtendedParams {}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withTwilioAuthentication())
handler.use(withDatabase)
handler.use(withQueryCleanse<ExtendedParams>({}))

handler.post(async (req, res) => {
  let data: string

  try {
    data = await text.respond(
      `TODO. Callback function for keywords. body: ${JSON.stringify(req.body)}`
    )
    res.setHeader("Content-Type", "text/xml")
    return res.status(200).send(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
