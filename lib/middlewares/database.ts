import { Middleware } from "next-connect"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"
import { connectToDatabase } from "../mongoose"

export const withDatabase: Middleware<ExtendedRequest, ExtendedResponse> =
  async (req, res, next) => {
    try {
      await connectToDatabase()
    } catch (error) {
      return res.status(400).json(JSON.stringify({ error: error.message }))
    }

    next()
  }
