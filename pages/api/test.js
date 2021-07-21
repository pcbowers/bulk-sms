import {
  connectToDatabase,
  MAX_DB_OPERATIONS,
  paginate,
  withCookies
} from "../../lib/export"

async function handler(req, res) {
  const {
    cursor = "",
    tags = "",
    tag = "",
    limit = MAX_DB_OPERATIONS.value
  } = req.query
  // console.log(req.cookies)
  // const count = req.cookies.test === undefined ? 0 : parseInt(req.cookies.test) + 1
  // res.cookie("test", count)

  console.log(MAX_DB_OPERATIONS.value)
  try {
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

export default withCookies(handler)
