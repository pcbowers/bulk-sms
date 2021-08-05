import {
  Document,
  model,
  Model,
  models,
  PopulatedDoc,
  Schema,
  SchemaTimestampsConfig,
  Types
} from "mongoose"
import { ContactDocument } from "./Contact"

interface MessageSchema {
  contact: Types.ObjectId
  messageId: string
  messageContent: string
}

interface MessageDocument extends MessageSchema {
  contact: PopulatedDoc<ContactDocument>
}

export interface InboxSchema {
  name: string
  description?: string
  unreadCount?: number
  messages?: MessageDocument[]
}

export interface InboxDocument
  extends InboxSchema,
    Document,
    SchemaTimestampsConfig {
  description: string
  unreadCount: number
  messages: Types.Array<MessageDocument>
}

const messageSchema = new Schema<MessageDocument>(
  {
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact"
    },
    messageId: {
      type: String,
      required: [true, "please specify a message id"],
      cast: false
    },
    messageContent: {
      type: String,
      required: [true, "please specify the message content"],
      cast: false
    }
  },
  { _id: false }
)

const inboxSchema = new Schema<InboxDocument>(
  {
    name: {
      type: String,
      required: [true, "please specify a name"],
      cast: false
    },
    description: {
      type: String,
      default: "",
      cast: false
    },
    unreadCount: {
      type: Number,
      default: 0,
      cast: false
    },
    messages: [
      {
        type: messageSchema
      }
    ]
  },
  { timestamps: true }
)

export const Inbox: Model<InboxDocument> =
  models.Inbox || model("Inbox", inboxSchema)
