import { getDocsByQueryPaginate } from "../../lib/helpers"
import { cookies } from "../../lib/middleware/cookies"
import { Contact } from "../../lib/models/Contact"
import { connectToDatabase } from "../../lib/mongoose"


async function handler(req, res) {
  const { next } = req.query
  // console.log(req.cookies)
  // const count = req.cookies.test === undefined ? 0 : parseInt(req.cookies.test) + 1
  // res.cookie("test", count)
  try {
    await connectToDatabase()
    res.status(200).json(await getDocsByQueryPaginate(Contact, {}, next, 2))
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export default cookies(handler)
