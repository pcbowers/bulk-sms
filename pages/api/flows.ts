import { UpdateWriteOpResult } from "mongoose"
import nextConnect from "next-connect"
import {
  MAX_OPERATIONS,
  PaginationResults,
  populateDocs
} from "../../lib/db_functions"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/middlewares"
import { flow, FlowDocument } from "../../lib/models"

interface ExtendedParams {
  populate: string
  cursor: string
  union: boolean
  limit: number
  sort: string[]
  ids: string[]
  overwrite: boolean
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
    populate: "string",
    ids: "string[]",
    overwrite: "boolean",
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]"
  })
)

handler.get(async (req, res) => {
  let data: PaginationResults & { data: FlowDocument[] }

  const {
    populate = "",
    cursor = "",
    union = false,
    limit = 50,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    if (Object.keys(filters).length >= 1)
      data = await flow.paginate.many(filters)({
        union,
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })
    else
      data = await flow.paginate.all({
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })

    if (populate) data.data = await populateDocs(data.data, populate)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data: FlowDocument[]

  const { populate = "" } = req.query

  try {
    if (!Array.isArray(req.body)) req.body = [req.body]
    data = await flow.create.many(req.body)()
    if (populate) data = await populateDocs(data, populate)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data: UpdateWriteOpResult

  let { overwrite = false, union = false, ...filters } = req.query

  try {
    data = await flow.update.many(filters)(req.body, {
      overwrite,
      union
    })

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
    data = await flow.delete.many({ "_id[in]": ids })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
