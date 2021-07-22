import { pipe } from "ramda"
import {
  connectToDatabase,
  MAX_DB_OPERATIONS,
  paginate,
  withCookies,
  withMethod,
  withUserAuthentication
} from "../../lib/export"

async function handler(req, res) {
  // console.log(req.cookies)
  // const count = req.cookies.test === undefined ? 0 : parseInt(req.cookies.test) + 1
  // res.cookie("test", count)

  try {
    res.limitMethods(["GET"])
    await res.authenticateUser()

    const {
      cursor = "",
      tags = "",
      tag = "",
      limit = MAX_DB_OPERATIONS.value
    } = req.query

    await connectToDatabase()

    res
      .status(200)
      .json(
        await paginate.contacts.byTag(
          (tags || tag).split(","),
          cursor,
          Number(limit)
        )
      )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export default pipe(withCookies, withUserAuthentication, withMethod)(handler)
