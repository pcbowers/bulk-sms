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
import { task, TaskDocument } from "../../../lib/models"

interface ExtendedParams {
  _id: string
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
    _id: "string",
    overwrite: "boolean"
  })
)

handler.get(async (req, res) => {
  let data: TaskDocument | null

  let { _id = "" } = req.query

  try {
    data = await task.get.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data: TaskDocument | null

  let { overwrite = false, _id = "" } = req.query

  try {
    data = await task.update.one.query({ _id })(req.body, {
      overwrite
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: TaskDocument | null

  const { _id = "" } = req.query
  try {
    data = await task.delete.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
