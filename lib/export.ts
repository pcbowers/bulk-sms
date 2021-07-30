import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {
  createDoc,
  createDocs,
  deleteDocById,
  deleteDocsByBuiltQuery,
  getDocById,
  getDocsByBuiltQuery,
  getDocsByBuiltQueryPaginate,
  getDocsByQuery,
  getDocsByQueryPaginate,
  getDocsCountByBuiltQuery,
  getDocsCountByQuery,
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

// middlewares
export { executeQuery } from "./helpers"
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
  count: {
    many: getDocsCountByBuiltQuery<ContactDocument>(Contact),
    all: getDocsCountByQuery<ContactDocument>(Contact)({})
  },
  get: {
    one: getDocById<ContactDocument>(Contact),
    many: getDocsByBuiltQuery<ContactDocument>(Contact),
    manyPaginate: getDocsByBuiltQueryPaginate<ContactDocument>(Contact),
    all: getDocsByQuery<ContactDocument>(Contact)({}),
    allPaginate: getDocsByQueryPaginate<ContactDocument>(Contact)({})
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
