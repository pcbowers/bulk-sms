import { connectToDatabase } from "../mongoose"

export const withDatabase = async (req, res, next) => {
  try {
    await connectToDatabase()
  } catch (error) {
    return res.status(400).json(JSON.stringify({ error: error.message }))
  }

  next()
}
