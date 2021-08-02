import { UpdateWriteOpResult } from "mongoose"
import nextConnect from "next-connect"
import { checkAdminStatus } from "../../lib/api_functions"
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
import { binding, contact, ContactDocument } from "../../lib/models"
interface ExtendedParams {
  ids: string[]
  phoneNumbers: string[]
  cursor: string
  union: boolean
  limit: number
  sort: string[]
  overwrite: boolean
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
    phoneNumbers: "string[]",
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]",
    overwrite: "boolean"
  })
)

handler.get(async (req, res) => {
  let data: PaginationResults & { data: ContactDocument[] }

  let {
    cursor = "",
    union = false,
    limit = 50,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    if (Object.keys(filters).length >= 1)
      data = await contact.paginate.many(filters)({
        union,
        cursor,
        limit,
        sortFields: sort,
        maxOperations: MAX_OPERATIONS
      })
    else
      data = await contact.paginate.all({
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

handler.patch(async (req, res) => {
  let data: UpdateWriteOpResult

  let { overwrite = false, union = false, ...filters } = req.query

  try {
    if (
      req.body.phoneNumber ||
      req.body.twilioIdentity ||
      req.body.twilioBindingId ||
      req.body.admin ||
      req.body.email
    )
      throw Error(
        "you cannot batch update a phoneNumber, admin, email, or twilio information."
      )

    const data = await contact.update.many(filters)(req.body, {
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
    const twilioBindingIds = (await contact.get.many({ "_id[in]": ids })()).map(
      (contact) => contact.twilioBindingId
    )

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
