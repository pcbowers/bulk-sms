import { Document as MongooseDocument, Model as MongooseModel } from "mongoose"
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
import {
  Broadcast,
  BroadcastDocument,
  BroadcastSchema
} from "./models/Broadcast"
import { Contact, ContactDocument, ContactSchema } from "./models/Contact"
import { Inbox, InboxDocument, InboxSchema } from "./models/Inbox"
import { Task, TaskDocument, TaskSchema } from "./models/Task"
import {
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
  twimlResponse
} from "./twilio"

// types
export type { BroadcastDocument, BroadcastSchema } from "./models/Broadcast"
export type { ContactDocument, ContactSchema } from "./models/Contact"
export type { InboxDocument, InboxSchema } from "./models/Inbox"
export type { TaskDocument, TaskSchema } from "./models/Task"

// text functions
export const text = {
  get: {
    one: getText,
    many: getTexts
  },
  respond: twimlResponse,
  broadcast: createBroadcast
}

// binding functions
export const binding = {
  get: {
    one: getBinding,
    all: getBindings,
    phoneNumber: getPhoneNumber
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

// function models for database
export const functionModel = <Document extends MongooseDocument, Schema>(
  Model: MongooseModel<Document>
) => {
  return {
    count: {
      many: getDocsCountByBuiltQuery<Document, true>(Model),
      all: getDocsCountByQuery<Document, true>(Model)({})
    },
    get: {
      one: {
        id: getDocById<Document, true>(Model),
        query: GetDocByBuiltQuery<Document, true>(Model)
      },
      many: getDocsByBuiltQuery<Document, true>(Model),
      all: getDocsByQuery<Document, true>(Model)({})
    },
    paginate: {
      many: getDocsByBuiltQueryPaginate<Document>(Model),
      all: getDocsByQueryPaginate<Document>(Model)({})
    },
    update: {
      one: {
        id: updateDocById<Document>(Model),
        query: updateDocByBuiltQuery<Document>(Model)
      },
      many: updateDocsByBuiltQuery<Document>(Model)
    },
    delete: {
      one: {
        id: deleteDocById<Document>(Model),
        query: deleteDocByBuiltQuery<Document>(Model)
      },
      many: deleteDocsByBuiltQuery<Document>(Model)
    },
    create: {
      one: createDoc<Document, Schema>(Model),
      many: createDocs<Document, Schema>(Model)
    }
  }
}

// database functions
export const contact = functionModel<ContactDocument, ContactSchema>(Contact)
export const broadcast = functionModel<BroadcastDocument, BroadcastSchema>(
  Broadcast
)
export const inbox = functionModel<InboxDocument, InboxSchema>(Inbox)
export const task = functionModel<TaskDocument, TaskSchema>(Task)
