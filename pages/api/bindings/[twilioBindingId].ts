import nextConnect from "next-connect"
import { BindingInstance } from "twilio/lib/rest/notify/v1/service/binding"
import { checkAdminStatus } from "../../../lib/api_functions"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../../lib/middlewares"
import { binding, contact, ContactDocument } from "../../../lib/models"

interface ExtendedParams {
  twilioBindingId: string
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
    twilioBindingId: "string"
  })
)

handler.get(async (req, res) => {
  let data: BindingInstance

  const { twilioBindingId = "" } = req.query

  try {
    data = await binding.get.one(twilioBindingId)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: ContactDocument | null

  const { twilioBindingId = "" } = req.query
  try {
    await checkAdminStatus(twilioBindingId, req)
    await binding.delete.one(twilioBindingId)
    data = await contact.delete.one.query({
      twilioBindingId: twilioBindingId
    })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
