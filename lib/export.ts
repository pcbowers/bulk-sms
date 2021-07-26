import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {
  createDoc,
  createDocs,
  getDoc,
  getDocByValue,
  getDocsByQueryPaginate,
  getDocsWithAllPaginate,
  getDocsWithAnyPaginate
} from "./helpers"
import { Contact, ContactDocument, ContactSchema } from "./models/Contact"

//interfaces
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
export { withQueryArray } from "./middleware/query_array"
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

interface ContactObject {
  findByAny: any
  findByAll: any
  findById: any
  findByValue: any
  findAll: any
  findByQuery: any
  create: {
    one: (schema: ContactSchema) => Promise<ContactDocument>
    many: any
  }
}

export const contact: ContactObject = {
  findByAny: getDocsWithAnyPaginate(Contact),
  findByAll: getDocsWithAllPaginate(Contact),
  findById: getDoc(Contact),
  findByValue: getDocByValue(Contact),
  findAll: getDocsByQueryPaginate(Contact, {}),
  findByQuery: getDocsByQueryPaginate(Contact),
  create: {
    one: createDoc(Contact),
    many: createDocs(Contact)
  }
}
