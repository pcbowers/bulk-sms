import { ExtendedRequest } from "./middlewares"
import { contact } from "./models"

/**
 * A function that throws if trying to delete an admin when you shouldn't
 * @param twilioBindingIds either an array or 1 twilio binding ID
 * @param req a request from the API
 */
export const checkAdminStatus = async (
  twilioBindingIds: string[] | string,
  req: ExtendedRequest
) => {
  const potentialAdmins = (
    await contact.get.many({
      "twilioBindingId[in]": twilioBindingIds
    })()
  )
    .filter((contact) => contact.admin)
    .map((contact) => contact.email)

  const allAdmins = await contact.get.many({
    admin: true
  })()

  if (potentialAdmins.includes(req.user?.email))
    throw Error(`you cannot remove yourself, you are an admin.`)

  if (allAdmins.length - potentialAdmins.length < 1)
    throw Error(`there must be at least one admin.`)
}
