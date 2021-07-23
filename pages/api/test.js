import { pipe } from "ramda"
import {
  connectToDatabase,
  getBindings,
  MAX_DB_OPERATIONS,
  withCookies,
  withMethod,
  withUserAuthentication
} from "../../lib/export"

async function handler(req, res) {
  // console.log(req.cookies)
  // const count = req.cookies.test === undefined ? 0 : parseInt(req.cookies.test) + 1
  // res.cookie("test", count)

  if (!res.limitMethods(["GET"]) || !(await res.authenticateUser()))
    return res.end()

  try {
    const {
      cursor = "",
      tags = "",
      tag = "",
      limit = MAX_DB_OPERATIONS.value
    } = req.query

    await connectToDatabase()

    res.status(200).json(
      // await paginate.contacts.byTag(
      //   (tags || tag).split(","),
      //   cursor,
      //   Number(limit)
      // )
      await getBindings()
    )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export default pipe(withCookies, withUserAuthentication, withMethod)(handler)

/*
The Plan:

Paths Kinda:
  texts
    Get Texts (Query Twilio)
  admins
    Get Admins (Query DB) <- just the admin boolean
    Post Admins (Query DB) <- just the admin boolean
    Delete Admins (Query DB) <- just the admin boolean
  tags
    Get Tags (Query DB) <- get all tags
    Patch Tags (Query DB) <- rename tag
    Delete Tags (Query DB) <- delete tag
  contacts
    Get Contacts (Query DB) <- get contacts
    Post Contacts (Query DB, Query Twilio) <- create contacts
    Delete Contacts (Query DB, Query Twilio) <- delete contacts
    Patch Contacts (Query DB, Query Twilio) <- update contacts
  flows
    Get Flows (Query DB) <- get flows
    Post Flows (Query DB) <- create flows
    Delete Flows (Query DB) <- delete flows
    Patch Flows (Query DB) <- update flows
  broadcasts
    Get Broadcasts (Query DB) <- get broadcasts
    Post Broadcasts (Query DB, Query Twilio) <- create broadcasts
  callbacks
    response
      Post ResponseData - Begin/Pick Up Flow (Query DB, Query Twilio?) <- do functions in flow
    broadcast
      Post BroadcastData - Populate Broadcast (Query DB, Query Twilio) <- update broadcasts

MVP:

- must login using goolge
- must authenticate routes based on user and twilio (for callbacks)

- broadcasts
  must send out a broadcast based on tags
  must be able to view broadcasts
  must be able to filter broadcasts by tag
  must be able to go into broadcasts and view user data

- contacts
  must be able to create a single user
  must be able to create multiple users
  must be able to import multiple users
  must be able to edit user information
  must be able to delete user
  must be able to delete users
  must be able to add tags
  must be able to delete tags
  must be able to update tags
  must be able to assign certain contacts as admins
  must force current user to remain as admin
  must be able to view contact history

- flows
  must be able to create flows
    these flows should be admin protected if desired
    these flows are composed of steps
    each step has no, 1, or many keywords
    each step has 1 or more tasks
    When received, tasks are run based on the response data
    If step 1, should not contain no keywords
  must be able to sort flows based on priority
  must be able to delete flows
  must be able to update flows
  must be able to assign responses to an inbox for later viewing

- inboxes
  must be able to view inbox with responses
  must be able to view read/unread count
*/
