import { Middleware } from "next-connect"
import { ironSession } from "next-iron-session"
import { ExtendedRequest, ExtendedResponse } from "../export"

export const withSession: Middleware<ExtendedRequest, ExtendedResponse> =
  ironSession({
    cookieName: "bulk-sms-session-cookie",
    password: process.env.NEXTAUTH_SECRET || "",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production"
    }
  })
