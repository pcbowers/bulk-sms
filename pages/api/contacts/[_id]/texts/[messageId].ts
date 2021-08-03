import nextConnect from "next-connect"
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message"
import { TWILIO_NUMBER } from "../../../../../lib/config"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../../../../lib/middlewares"
import { contact, text } from "../../../../../lib/models"

interface ExtendedParams {
  _id: string
  messageId: string
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
    _id: "string",
    messageId: "string"
  })
)

handler.get(async (req, res) => {
  let data: MessageInstance

  const { _id = "", messageId = "" } = req.query

  try {
    const cntct = await contact.get.one.id(_id)

    if (!cntct) throw Error(`${_id} contact does not exist.`)

    const txt = await text.get.one(messageId)

    const phoneNumber = txt.from === TWILIO_NUMBER ? txt.to : txt.from

    const checkContact = await contact.get.one.query({ phoneNumber })()

    if (!checkContact)
      throw Error(
        `${messageId} message does not correspond to an existing user.`
      )

    // Only != instead of !== because checkContact type is different
    if (checkContact._id != _id)
      throw Error(`${messageId} does not correspond to this user.`)

    data = txt
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
