import nextConnect from "next-connect"
import {
  contact,
  createBinding,
  createBindings,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/export"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(withQueryCleanse)

interface UrlParamInput {
  union?: string | string[]
  limit?: string | string[]
  sort?: string | string[]
  cursor?: string | string[]
  filters?: { [key: string]: string | string[] }
}

interface UrlParamOutput {
  union?: boolean
  limit?: number
  sort?: string[]
  cursor?: string
  filters?: { [key: string]: string | string[] }
}

const cleanseQuery = (query: UrlParamInput) => {
  const { union, limit, sort, cursor, ...filters } = query

  const cleansedQuery: UrlParamOutput = {
    ...filters
  }

  if (union)
    cleansedQuery.union =
      union === "true" || (Array.isArray(union) && union.includes("true"))

  if (limit) cleansedQuery.limit = Number(limit)

  if (sort) cleansedQuery.sort = typeof sort === "string" ? [sort] : sort

  if (cursor) cleansedQuery.cursor = String(cursor)

  return cleansedQuery
}

handler.get(async (req, res) => {
  let data

  let {
    cursor = "",
    union = false,
    limit = 100,
    sort = ["-_id"],
    ...filters
  } = cleanseQuery(req.query)

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
