import nextConnect from "next-connect"
import { BindingInstance } from "twilio/lib/rest/notify/v1/service/binding"
import {
  binding,
  checkAdminStatus,
  contact,
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/export"
import { ContactDocument } from "../../lib/models/Contact"

interface ExtendedParams {
  phoneNumbers: string[]
  twilioBindingIds: string[]
}

interface Request extends ExtendedRequest {
  query: ExtendedParams & DefaultParams
}

const handler = nextConnect<Request, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(
  withQueryCleanse<ExtendedParams>({
    phoneNumbers: "string[]",
    twilioBindingIds: "string[]"
  })
)

handler.get(async (req, res) => {
  let data: BindingInstance[]
  try {
    data = await binding.get.all()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data: ContactDocument[]

  const { phoneNumbers = [] } = req.query
  try {
    const twilioData = await binding.create.many(phoneNumbers)
    data = await contact.create.many(twilioData)()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: {
    ok?: number | undefined
    n?: number | undefined
    deletedCount?: number | undefined
  }

  const { twilioBindingIds = [] } = req.query
  try {
    await checkAdminStatus(twilioBindingIds, req)
    await binding.delete.many(twilioBindingIds)
    data = await contact.delete.many({
      "twilioBindingId[in]": twilioBindingIds
    })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
