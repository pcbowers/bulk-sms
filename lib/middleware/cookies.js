import { serialize } from "cookie"

const createCookie = (res, name, value, options = {}) => {
  const stringValue =
    typeof value === "object" ? "j:" + JSON.stringify(value) : String(value)

  if ("maxAge" in options) {
    options.expires = new Date(Date.now() + options.maxAge)
    options.maxAge /= 1000
  }

  res.setHeader("Set-Cookie", serialize(name, String(stringValue), options))
}

export const withCookies = (handler) => (req, res) => {
  res.cookie = (name, value, options) => createCookie(res, name, value, options)

  return handler(req, res)
}
