import nextConnect from "next-connect"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withTwilioAuthentication,
  withUserAuthentication
} from "../../../lib/middlewares"
import { broadcast, BroadcastDocument, contact } from "../../../lib/models"

interface ExtendedParams {
  _id: string
  overwrite: boolean
}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication(["POST"]))
handler.use(withTwilioAuthentication(["GET", "PATCH", "DELETE"]))
handler.use(withDatabase)
handler.use(
  withQueryCleanse<ExtendedParams>({
    _id: "string",
    overwrite: "boolean"
  })
)

handler.get(async (req, res) => {
  let data: BroadcastDocument | null

  let { _id = "" } = req.query

  try {
    data = await broadcast.get.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data: BroadcastDocument | null

  let { overwrite = false, _id = "" } = req.query

  try {
    let counts = {
      requested: 0,
      sent: 0,
      queued: 0,
      failed: 0,
      delivered: 0,
      undelivered: 0,
      other: 0
    }

    let messageInfo: { [key: string]: string } = {}

    const messageKeys = Object.keys(req.body).filter((key) =>
      key.startsWith("DeliveryState")
    )

    messageKeys.forEach((messageKey) => {
      const parsedMsg = JSON.parse(req.body[messageKey])

      messageInfo[parsedMsg.identity] = parsedMsg.sid

      const countType = parsedMsg.status.toLowerCase()
      if (countType in counts) counts[countType as "sent"] += 1
      else counts.other += 1
      counts.requested += 1
    })

    const contacts = (
      await contact.get.many({
        "twilioIdentity[in]": Object.keys(messageInfo)
      })()
    ).map((contact) => {
      return {
        messageId: messageInfo[contact.twilioIdentity],
        contact: contact._id
      }
    })

    data = await broadcast.update.one.query({ _id })(
      {
        totalRequested: counts.requested,
        totalQueued: counts.queued,
        totalFailed: counts.failed,
        totalSent: counts.sent,
        totalDelivered: counts.delivered,
        totalUndelivered: counts.undelivered,
        totalOther: counts.other,
        messages: contacts
      },
      {
        overwrite
      }
    )

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data: BroadcastDocument | null

  let { overwrite = false, _id = "" } = req.query

  try {
    data = await broadcast.update.one.query({ _id })(req.body, {
      overwrite
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: BroadcastDocument | null

  const { _id = "" } = req.query
  try {
    data = await broadcast.delete.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
