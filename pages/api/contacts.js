import { pipe } from "ramda"
import {
  connectToDatabase,
  contact,
  createBinding,
  createBindings,
  withMethod,
  withUserAuthentication
} from "../../lib/export"

async function handler(req, res) {
  if (
    !res.limitMethods(["GET", "POST", "DELETE", "PATCH"]) ||
    !(await res.authenticateUser())
  )
    return res.end()

  try {
    await connectToDatabase()
    let data

    if (req.method === "GET") {
      const {
        cursor = "",
        tags = "",
        tag = "",
        ids = "",
        id = "",
        twilioBindingId = "",
        twilioBindingIds = "",
        twilioIdentity = "",
        twilioIdentities = "",
        phoneNumber = "",
        phoneNumbers = "",
        email = "",
        emails = "",
        search = "",
        union = "true",
        limit = 100
      } = req.query

      if ((tags || tag) && union === "false") {
        data = await contact.findByAllTags(tags || tag, cursor, limit)
      } else if ((tags || tag) && union === "true") {
        data = await contact.findByAnyTag(tags || tag, cursor, limit)
      } else if (ids) {
        data = await contact.findByAnyId(ids, cursor, limit)
      } else if (id) {
        data = await contact.findById(id).exec()
      } else if (twilioBindingIds) {
        data = await contact.findByAnyTwilioBindingId(
          twilioBindingIds,
          cursor,
          limit
        )
      } else if (twilioBindingId) {
        data = await contact.findByTwilioBindingId(twilioBindingId).exec()
      } else if (twilioIdentities) {
        data = await contact.findByAnyTwilioIdentity(
          twilioIdentities,
          cursor,
          limit
        )
      } else if (twilioIdentity) {
        data = await contact.findByTwilioIdentity(twilioIdentity).exec()
      } else if (phoneNumbers) {
        data = await contact.findByAnyPhoneNumber(phoneNumbers, cursor, limit)
      } else if (phoneNumber) {
        data = await contact.findByPhoneNumber(phoneNumber).exec()
      } else if (emails) {
        data = await contact.findByAnyEmail(emails, cursor, limit)
      } else if (email) {
        data = await contact.findByEmail(email).exec()
      } else if (search) {
        data = await contact.findByQuery(
          {
            $or: [
              { phoneNumber: new RegExp(search, "i") },
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { tags: new RegExp(search, "i") }
            ]
          },
          cursor,
          limit
        )
      } else {
        data = await contact.findAll(cursor, limit)
      }
    } else if (req.method === "POST") {
      if (!Array.isArray(req.body)) {
        const twilioData = await createBinding(req.body)
        data = await contact.create.one(twilioData)
      } else {
        const twilioData = await createBindings(req.body)
        console.log(twilioData)
        data = await contact.create.many(twilioData)
      }
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export default pipe(withUserAuthentication, withMethod)(handler)
