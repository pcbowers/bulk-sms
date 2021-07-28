import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {
  createDoc,
  createDocs,
  getDoc,
  getDocsByBuiltQueryPaginate
} from "./helpers"
import { Contact } from "./models/Contact"

//interfaces
export interface DefaultParams {
  [key: string]: string | string[]
}

export interface ExtendedRequest extends NextApiRequest {
  session: Session
}

export interface CookieOptions {
  expires?: Date
  maxAge?: number
}

export interface ExtendedResponse extends NextApiResponse {
  cookie(name: string, value: string, options?: CookieOptions): void
}

// middlewares
export { MAX_DB_OPERATIONS } from "./helpers"
export { withCookies } from "./middleware/cookies"
export { withDatabase } from "./middleware/database"
export { withQueryCleanse } from "./middleware/query_cleanse"
export { withSession } from "./middleware/session"
export { withTwilioAuthentication } from "./middleware/twilio_auth"
export { withUserAuthentication } from "./middleware/user_auth"
// other
export { connectToDatabase } from "./mongoose"
//twilio functions
export {
  createBinding,
  createBindings,
  createBroadcast,
  deleteBinding,
  deleteBindings,
  getBinding,
  getBindings,
  getPhoneNumber,
  getText,
  getTexts,
  twimlResponse,
  updateBinding,
  updateBindings
} from "./twilio"

// database functions
export const contact = {
  findById: getDoc(Contact),
  findByQuery: getDocsByBuiltQueryPaginate(Contact),
  create: {
    one: createDoc(Contact),
    many: createDocs(Contact)
  }
}
