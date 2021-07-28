import { NextApiRequest } from "next"
import { Middleware } from "next-connect"
import { ExtendedResponse } from "../export"

export const withQueryCleanse: Middleware<NextApiRequest, ExtendedResponse> =
  async (req, res, next) => {
    const queryValues = Object.keys(req.query).map((key: string) => {
      const parameter = req.query[key]
      let values = []

      if (Array.isArray(parameter)) {
        values = [
          ...parameter
            .map((val) => val.split(","))
            .reduce((prev, current) => [...prev, ...current], [])
        ]
      } else {
        values = [...parameter.split(",")]
      }

      if (values.length > 1) return values
      else return values[0]
    })

    req.query = Object.keys(req.query).reduce(
      (prev, current, index) => ({
        ...prev,
        [current]: queryValues[index]
      }),
      {}
    )

    next()
  }
