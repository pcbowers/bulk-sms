import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {
  createDoc,
  createDocs,
  deleteDocById,
  deleteDocsByBuiltQuery,
  getDocById,
  getDocsByBuiltQueryPaginate,
  getDocsByQueryPaginate,
  updateDocById,
  updateDocsByBuiltQuery
} from "./helpers"
import { Contact, ContactDocument, ContactSchema } from "./models/Contact"

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
  get: {
    one: getDocById<ContactDocument>(Contact),
    many: getDocsByBuiltQueryPaginate<ContactDocument>(Contact),
    all: getDocsByQueryPaginate<ContactDocument>(Contact)({})
  },
  update: {
    one: updateDocById<ContactDocument>(Contact),
    many: updateDocsByBuiltQuery<ContactDocument>(Contact)
  },
  delete: {
    one: deleteDocById<ContactDocument>(Contact),
    many: deleteDocsByBuiltQuery<ContactDocument>(Contact)
  },
  create: {
    one: createDoc<ContactDocument, ContactSchema>(Contact),
    many: createDocs<ContactDocument, ContactSchema>(Contact)
  }
}
