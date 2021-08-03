import nextConnect from "next-connect"
import { MAX_OPERATIONS, PaginationResults } from "../../lib/db_functions"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/middlewares"
import { broadcast, BroadcastDocument, contact, text } from "../../lib/models"

interface ExtendedParams {
  tag: string
  cursor: string
  union: boolean
  limit: number
  sort: string[]
  ids: string[]
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
    tag: "string",
    ids: "string[]",
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]"
  })
)

handler.get(async (req, res) => {
  let data: PaginationResults & { data: BroadcastDocument[] }

  const {
    cursor = "",
    union = false,
    limit = 50,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    if (Object.keys(filters).length >= 1)
      data = await broadcast.paginate.many(filters)({
        union,
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })
    else
      data = await broadcast.paginate.all({
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data

  const { tag = "all" } = req.query

  try {
    const newBroadcast = await broadcast.create.one({
      tags: [tag],
      message: req.body
    })

    const filter =
      tag !== "all" ? { "tags[in]": [tag] } : { "twilioIdentity[exists]": true }

    const identities = (await contact.get.many(filter)()).map(
      (contact) => contact.twilioIdentity
    )

    console.log(identities)

    data = await text.broadcast({
      identities,
      id: newBroadcast._id,
      message: req.body
    })

    return res
      .status(200)
      .json({ ...data, broadcastId: newBroadcast.id, broadcastTags: [tag] })
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

  const { ids = [] } = req.query

  try {
    data = await broadcast.delete.many({ "_id[in]": ids })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
