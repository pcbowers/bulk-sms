import { NextApiRequest } from "next"
import { Middleware } from "next-connect"
import { DefaultParams, ExtendedResponse } from "../export"

const castType = (newType: string, value: string | string[], key: string) => {
  switch (newType) {
    case "null":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      if (value !== "null" && value !== "") throw Error(`${key} must be null`)
      return null
    case "undefined":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      if (value !== "undefined" && value !== "")
        throw Error(`${key} must be undefined`)
      return undefined
    case "boolean":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      if (!["true", "false", "1", "0", ""].includes(value))
        throw Error(`${key} must be a boolean`)
      return value === "true"
    case "boolean[]":
      if (!Array.isArray(value)) value = [value]
      if (value.some((val) => !["true", "false", "1", "0", ""].includes(val)))
        throw Error(`${key} must contain boolean values`)
      return value.map((val) => val === "true")
    case "integer":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      if (!Number.isInteger(Number(value)))
        throw Error(`${key} must be an integer`)
      return parseInt(value)
    case "integer[]":
      if (!Array.isArray(value)) value = [value]
      if (value.some((val) => !Number.isInteger(Number(val))))
        throw Error(`${key} must contain integer values`)
      return value.map((val) => parseInt(val))
    case "number":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      if (isNaN(Number(value))) throw Error(`${key} must be a number`)
      return parseFloat(value)
    case "number[]":
      if (!Array.isArray(value)) value = [value]
      if (value.some((val) => isNaN(Number(val))))
        throw Error(`${key} must contain number values`)
      return value.map((val) => parseFloat(val))
    case "string":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      return value
    case "string[]":
      if (!Array.isArray(value)) value = [value]
      return value
    case "object":
      if (typeof value !== "string") throw Error(`${key} must be a string`)
      try {
        return JSON.parse(value)
      } catch (error) {
        throw Error(`${key} must be valid JSON`)
      }
    case "object[]":
      if (!Array.isArray(value)) value = [value]
      try {
        return value.map((val) => JSON.parse(val))
      } catch (error) {
        throw Error(`${key} must be contain valid JSON values`)
      }
  }
}

const castQueryParams = <AdditionalParams>(
  typesDesired: { [key: string]: string },
  query: DefaultParams
): AdditionalParams & DefaultParams => {
  const { union, limit, sort, cursor, ...otherQueryParams } = query

  const uncleansedParams: { [key: string]: string } = Object.keys(query)
    .filter((key) => {
      return !typesDesired.hasOwnProperty(key)
    })
    .reduce((acc, key) => ((acc[key] = query[key]), acc), {} as any)

  const ToCleanseParams: { [key: string]: string } = Object.keys(query)
    .filter((key) => {
      return typesDesired.hasOwnProperty(key)
    })
    .reduce((acc, key) => ((acc[key] = query[key]), acc), {} as any)

  const cleansedParams = Object.keys(ToCleanseParams)
    .map((key) => {
      const oldValue = ToCleanseParams[key]
      return [key, castType(typesDesired[key], oldValue, key)]
    })
    .reduce((acc, param) => ((acc[param[0]] = param[1]), acc), {} as any)

  const cleansedQuery: AdditionalParams & DefaultParams = {
    ...uncleansedParams,
    ...cleansedParams
  }

  return cleansedQuery
}

const groupQueryParams = (query: { [key: string]: string | string[] }) => {
  return Object.keys(query)
    .map((key) => {
      const value = query[key]

      let values: string[]
      if (Array.isArray(value))
        values = value.reduce(
          (acc, val) => [...acc, ...val.split(",")],
          [] as string[]
        )
      else values = value.split(",")

      return [key, values.length > 1 ? values : values[0]] as [
        string,
        string | string[]
      ]
    })
    .reduce(
      (acc, param) => ((acc[param[0]] = param[1]), acc),
      {} as { [key: string]: string | string[] }
    )
}

export const withQueryCleanse =
  <AdditionalParams>(
    paramsToCleanse: { [key: string]: string } = {}
  ): Middleware<NextApiRequest, ExtendedResponse> =>
  async (req, res, next) => {
    try {
      req.query = groupQueryParams(req.query)
      req.query = castQueryParams<AdditionalParams>(paramsToCleanse, req.query)
    } catch (error) {
      return res.status(401).json(JSON.stringify({ error: error.message }))
    }

    next()
  }
