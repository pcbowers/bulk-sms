import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"

export { withCookies } from "./middlewares/cookies"
export { withDatabase } from "./middlewares/database"
export { withQueryCleanse } from "./middlewares/query_cleanse"
export { withSession } from "./middlewares/session"
export { withTwilioAuthentication } from "./middlewares/twilio_auth"
export { withUserAuthentication } from "./middlewares/user_auth"

//interfaces
export interface DefaultParams {
  [key: string]: string | string[]
}

export interface ExtendedRequest extends NextApiRequest {
  session: Session
  user: {
    email: string
    name: string
    picture: string
  }
}

export interface CookieOptions {
  expires?: Date
  maxAge?: number
}

export interface ExtendedResponse extends NextApiResponse {
  cookie(name: string, value: string, options?: CookieOptions): void
}
