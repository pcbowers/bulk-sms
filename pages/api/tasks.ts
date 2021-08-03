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
import { task, TaskDocument } from "../../lib/models"

interface ExtendedParams {
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
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(
  withQueryCleanse<ExtendedParams>({
    ids: "string[]",
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]"
  })
)

handler.get(async (req, res) => {
  let data: PaginationResults & { data: TaskDocument[] }

  const {
    cursor = "",
    union = false,
    limit = 50,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    if (Object.keys(filters).length >= 1)
      data = await task.paginate.many(filters)({
        union,
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })
    else
      data = await task.paginate.all({
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
  let data: TaskDocument[]

  try {
    if (!Array.isArray(req.body)) req.body = [req.body]
    data = await task.create.many(req.body)()
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

  const { ids = [] } = req.query

  try {
    data = await task.delete.many({ "_id[in]": ids })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
