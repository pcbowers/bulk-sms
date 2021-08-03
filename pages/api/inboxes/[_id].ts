import nextConnect from "next-connect"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../../lib/middlewares"
import { inbox, InboxDocument } from "../../../lib/models"

interface ExtendedParams {
  _id: string
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
    _id: "string",
    overwrite: "boolean"
  })
)

handler.get(async (req, res) => {
  let data: InboxDocument | null

  let { _id = "" } = req.query

  try {
    data = await inbox.get.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data: InboxDocument | null

  let { overwrite = false, _id = "" } = req.query

  try {
    data = await inbox.update.one.query({ _id })(req.body, {
      overwrite
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: InboxDocument | null

  const { _id = "" } = req.query
  try {
    data = await inbox.delete.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
