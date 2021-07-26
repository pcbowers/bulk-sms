import nextConnect from "next-connect"
import {
  contact,
  createBinding,
  createBindings,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryArray,
  withSession,
  withUserAuthentication
} from "../../lib/export"

const handler = nextConnect<ExtendedRequest, ExtendedResponse>()
handler.use(withSession)
handler.use(withUserAuthentication)
handler.use(withDatabase)
handler.use(withQueryArray)

handler.get(async (req, res) => {
  let data

  const { cursor = "", union = "true", limit = 100 } = req.query
  let { sort = "-_id" } = req.query

  try {
    if (typeof sort === "string") sort = [sort]
    data = await contact.findAll(cursor, limit, sort)
    return res.status(200).json({ data })
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
