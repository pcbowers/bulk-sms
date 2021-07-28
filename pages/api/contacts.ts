import nextConnect from "next-connect"
import {
  contact,
  createBinding,
  createBindings,
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/export"

interface ExtendedParams {
  cursor: string
  union: boolean
  limit: number
  sort: string[]
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
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]"
  })
)

handler.get(async (req, res) => {
  let data

  let {
    cursor = "",
    union = false,
    limit = 100,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    data = await contact.findByQuery(filters, union, cursor, limit, sort)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data

  try {
    if (!Array.isArray(req.body)) {
      const twilioData = await createBinding(req.body)
      data = await contact.create.one(twilioData)
    } else {
      const twilioData = await createBindings(req.body)
      data = await contact.create.many(twilioData)
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
