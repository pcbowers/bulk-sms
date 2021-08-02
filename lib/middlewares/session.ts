import { Middleware } from "next-connect"
import { ironSession } from "next-iron-session"
import { CURRENT_URL, SESSION_SECRET } from "../config"
import { ExtendedRequest, ExtendedResponse } from "../middlewares"

export const withSession: Middleware<ExtendedRequest, ExtendedResponse> =
  ironSession({
    cookieName: "bulk-sms-session-cookie",
    password: SESSION_SECRET,
    cookieOptions: {
      secure: CURRENT_URL === "http://localhost:3000"
    }
  })
