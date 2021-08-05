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
import { contact, inbox, text } from "../../../lib/models"

interface ExtendedParams {}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

interface Message {
  MessageSid: string
  SmsSid: string
  AccountSid: string
  MessagingServiceSid: string
  From: string
  To: string
  Body: string
  NumMedia: string
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withTwilioAuthentication())
handler.use(withDatabase)
handler.use(withQueryCleanse<ExtendedParams>({}))

const addToInbox = async (inboxName: string, message: Message) => {
  const currInbox = await inbox.get.one.query({ name: inboxName })()
  const currContact = await contact.get.one.query({
    phoneNumber: message.From
  })()

  if (!currInbox) throw Error(`${inboxName} inbox does not exist.`)

  const currMessage = {
    ...(currContact && { contact: currContact._id }),
    messageId: message.MessageSid,
    messageContent: message.Body
  }

  await inbox.update.one.id(currInbox._id, {
    $push: { messages: currMessage }
  })
}

handler.post(async (req, res) => {
  let data: string

  try {
    await addToInbox("All Messages", req.body)

    data = await text.respond("")
    res.setHeader("Content-Type", "text/xml")
    return res.status(200).send(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
