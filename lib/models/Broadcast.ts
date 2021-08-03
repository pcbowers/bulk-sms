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
}

interface MessageDocument extends MessageSchema {
  contact: PopulatedDoc<ContactDocument>
}

export interface BroadcastSchema {
  message: string
  totalRequested?: number
  totalQueued?: number
  totalFailed?: number
  totalSent?: number
  totalDelivered?: number
  totalUndelivered?: number
  totalOther?: number
  tags?: string[]
  messages?: MessageDocument[]
}

export interface BroadcastDocument
  extends BroadcastSchema,
    Document,
    SchemaTimestampsConfig {
  totalRequested: number
  totalQueued: number
  totalFailed: number
  totalSent: number
  totalDelivered: number
  totalUndelivered: number
  totalOther: number
  tags: Types.Array<string>
  messages: Types.Array<MessageDocument>
}

const messageSchema = new Schema<MessageDocument>(
  {
    contact: {
      type: Schema.Types.ObjectId,
      required: [true, "please specify a contact"],
      ref: "Contact"
    },
    messageId: {
      type: String,
      required: [true, "please specify a message id"],
      cast: false
    }
  },
  { _id: false }
)

const broadcastSchema = new Schema<BroadcastDocument>(
  {
    message: {
      type: String,
      required: [true, "please specify a message"],
      cast: false
    },
    totalRequested: {
      type: Number,
      default: 0,
      cast: false
    },
    totalQueued: {
      type: Number,
      cast: false
    },
    totalFailed: {
      type: Number,
      default: 0,
      cast: false
    },
    totalSent: {
      type: Number,
      default: 0,
      cast: false
    },
    totalDelivered: {
      type: Number,
      default: 0,
      cast: false
    },
    totalUndelivered: {
      type: Number,
      default: 0,
      cast: false
    },
    totalOther: {
      type: Number,
      default: 0,
      cast: false
    },
    tags: [
      {
        type: String,
        cast: false
      }
    ],
    messages: [
      {
        type: messageSchema
      }
    ]
  },
  { timestamps: true }
)

export const Broadcast: Model<BroadcastDocument> =
  models.Broadcast || model("Broadcast", broadcastSchema)
