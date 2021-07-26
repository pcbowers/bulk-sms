import { serialize } from "cookie"
import { NextApiRequest, NextApiResponse } from "next"
import { Middleware } from "next-connect"

interface CookieOptions {
  expires?: Date
  maxAge?: number
}

interface ExtendedResponse extends NextApiResponse {
  cookie(name: string, value: string, options?: CookieOptions): void
}

const createCookie = (
  res: ExtendedResponse,
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value)

  if (options?.maxAge && options?.expires) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader("Set-Cookie", serialize(name, String(stringValue), options))
}

export const withCookies: Middleware<NextApiRequest, ExtendedResponse> = async (
  req,
  res,
  next
) => {
  res.cookie = (name, value, options) => createCookie(res, name, value, options)
  next()
}
