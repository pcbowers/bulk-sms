import nextConnect from "next-connect"
import { checkAdminStatus } from "../../../lib/api_functions"
import { GOOGLE_DOMAIN } from "../../../lib/config"
import {
  DefaultParams,
  ExtendedRequest,
  ExtendedResponse,
  withDatabase,
  withQueryCleanse,
  withSession,
  withUserAuthentication
} from "../../../lib/middlewares"
import { binding, contact, ContactDocument } from "../../../lib/models"

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
  let data: ContactDocument | null

  let { _id = "" } = req.query

  try {
    data = await contact.get.one.query({ _id })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.patch(async (req, res) => {
  let data: ContactDocument | null

  let { overwrite = false, _id = "" } = req.query

  try {
    if (
      req.body.phoneNumber ||
      req.body.twilioIdentity ||
      req.body.twilioBindingId
    )
      throw Error(
        "You cannot update phone information. Delete and re-add if you want to update a phone number."
      )

    if (
      req.body?.admin &&
      !req.body?.email &&
      !(await contact.get.one.query({ _id })())?.get("email")
    )
      throw Error(
        "You cannot make someone an admin without assigning them an email."
      )

    if (
      req.body?.email &&
      typeof req.body.email === "string" &&
      !req.body?.email?.endsWith(GOOGLE_DOMAIN)
    )
      throw Error("Only @bedrocklynchburg.com emails can be used.")

    data = await contact.update.one.query({ _id })(req.body, {
      overwrite
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

handler.delete(async (req, res) => {
  let data: ContactDocument | null

  const { _id = "" } = req.query
  try {
    const twilioBindingId = (await contact.get.one.query({ _id })())
      ?.twilioBindingId

    if (twilioBindingId === undefined)
      throw Error("this contact does not exist.")

    await checkAdminStatus(twilioBindingId, req)
    await binding.delete.one(twilioBindingId)
    data = await contact.delete.one.query({
      twilioBindingId: twilioBindingId
    })()
    return res.status(200).json(data)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

export default handler
