import nextConnect from "next-connect"
import {
  contact,
  createBindings,
  DefaultParams,
  deleteBindings,
  executeQuery,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../lib/export"
import { ContactDocument } from "../../lib/models/Contact"

interface ExtendedParams {
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
    cursor: "string",
    union: "boolean",
    limit: "integer",
    sort: "string[]",
    overwrite: "boolean"
  })
)

handler.get(async (req, res) => {
  let data

  let {
    cursor = "",
    union = false,
    limit = 50,
    sort = ["-_id"],
    ...filters
  } = req.query

  try {
    if (Object.keys(filters).length >= 1)
      data = await contact.get.manyPaginate(filters)({
        union,
        cursor,
        limit,
        sortFields: sort,
        maxOperations: 100
      })
    else
      data = await contact.get.allPaginate({
        cursor,
        limit,
        sortFields: sort,
        maxOperations: 100
      })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  let data

  try {
    if (!Array.isArray(req.body)) req.body = [req.body]

    if (req.body.some((item: any) => item.admin && !item.email))
      throw Error(`an admin must have an email address`)

    const withPhones = req.body.filter((item: any) => item.phoneNumber)
    const withoutPhones = req.body.filter((item: any) => !item.phoneNumber)

    const twilioData = await createBindings(withPhones)

    data = await contact.create.many([...withoutPhones, ...twilioData])

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data

  let { union = false, ...filters } = req.query

  try {
    if (!Array.isArray(req.body)) req.body = [req.body]

    const items = await executeQuery<ContactDocument[], ContactDocument>(
      (
        await contact.get.many(filters)({ union })
      )()
    )()

    const adminsToDelete = items.filter((item) => item.admin)

    if (adminsToDelete.length) {
      console.log(req.user)
      if (adminsToDelete.some((item) => item.email === req.user.email))
        throw Error("you cannot delete yourself")

      const count = await executeQuery<number, ContactDocument>(
        contact.count.many(filters)({ union })
      )()
      if (adminsToDelete.length - count < 1)
        throw Error("you must have at least one admin")
    }

    const itemsWithBindings = items.filter((item) => item.twilioBindingId) as {
      twilioBindingId: string
    }[]

    await deleteBindings(itemsWithBindings.map((item) => item.twilioBindingId))
    data = await contact.delete.many(filters)({ union })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data

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
        "you cannot batch update a phoneNumber, admin, email, or twilio information"
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

export default handler
