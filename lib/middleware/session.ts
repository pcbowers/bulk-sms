import { ironSession } from "next-iron-session"

export const withSession = ironSession({
  cookieName: "bulk-sms-session-cookie",
  password: process.env.NEXTAUTH_SECRET || "",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production"
  }
})
