import { NextApiRequest, NextApiResponse } from "next"
import { Session } from "next-iron-session"
import {
  createDoc,
  createDocs,
  deleteDocByBuiltQuery,
  deleteDocById,
  deleteDocsByBuiltQuery,
  GetDocByBuiltQuery,
  getDocById,
  getDocsByBuiltQuery,
  getDocsByBuiltQueryPaginate,
  getDocsByQuery,
  getDocsByQueryPaginate,
  getDocsCountByBuiltQuery,
  getDocsCountByQuery,
  updateDocByBuiltQuery,
  updateDocById,
  updateDocsByBuiltQuery
} from "./db_functions"
import { Contact, ContactDocument, ContactSchema } from "./models/Contact"
import {
  createBinding,
  createBindings,
  createBroadcast,
  deleteBinding,
  deleteBindings,
  getBinding,
  getBindings,
  getText,
  getTexts,
  twimlResponse
} from "./twilio"

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

// database functions
export { queryWrapper } from "./db_functions"
export type { PaginationResults } from "./db_functions"
// generic helpers
export { checkAdminStatus, decrypt, encrypt, pluralizer } from "./helpers"
//middlewares
export { withCookies } from "./middleware/cookies"
export { withDatabase } from "./middleware/database"
export { withQueryCleanse } from "./middleware/query_cleanse"
export { withSession } from "./middleware/session"
export { withTwilioAuthentication } from "./middleware/twilio_auth"
export { withUserAuthentication } from "./middleware/user_auth"
// other
export { connectToDatabase } from "./mongoose"
// middlewares
export const MAX_OPERATIONS = 2000

// database functions
export const text = {
  get: {
    one: getText,
    many: getTexts
  },
  respond: twimlResponse,
  boradcast: createBroadcast
}

export const binding = {
  get: {
    one: getBinding,
    all: getBindings
  },
  create: {
    one: createBinding,
    many: createBindings
  },
  delete: {
    one: deleteBinding,
    many: deleteBindings
  }
}

export const contact = {
  count: {
    many: getDocsCountByBuiltQuery<ContactDocument, true>(Contact),
    all: getDocsCountByQuery<ContactDocument, true>(Contact)({})
  },
  get: {
    one: {
      id: getDocById<ContactDocument, true>(Contact),
      query: GetDocByBuiltQuery<ContactDocument, true>(Contact)
    },
    many: getDocsByBuiltQuery<ContactDocument, true>(Contact),
    all: getDocsByQuery<ContactDocument, true>(Contact)({})
  },
  paginate: {
    many: getDocsByBuiltQueryPaginate<ContactDocument>(Contact),
    all: getDocsByQueryPaginate<ContactDocument>(Contact)({})
  },
  update: {
    one: {
      id: updateDocById<ContactDocument>(Contact),
      query: updateDocByBuiltQuery<ContactDocument>(Contact)
    },
    many: updateDocsByBuiltQuery<ContactDocument>(Contact)
  },
  delete: {
    one: {
      id: deleteDocById<ContactDocument>(Contact),
      query: deleteDocByBuiltQuery<ContactDocument>(Contact)
    },
    many: deleteDocsByBuiltQuery<ContactDocument>(Contact)
  },
  create: {
    one: createDoc<ContactDocument, ContactSchema>(Contact),
    many: createDocs<ContactDocument, ContactSchema>(Contact)
  }
}
