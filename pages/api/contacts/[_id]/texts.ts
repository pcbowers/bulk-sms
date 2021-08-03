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
} from "../../../../lib/middlewares"
import { contact, text } from "../../../../lib/models"

interface ExtendedParams {
  _id: string
}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication())
handler.use(withDatabase)
handler.use(
  withQueryCleanse<ExtendedParams>({
    _id: "string"
  })
)

handler.get(async (req, res) => {
  let data: MessageInstance[]

  const { _id = "" } = req.query

  try {
    const cntct = await contact.get.one.id(_id)

    if (!cntct) throw Error(`${_id} contact does not exist.`)

    data = await text.get.many(cntct.twilioBindingId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
