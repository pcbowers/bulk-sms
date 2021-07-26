import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig,
  Types
} from "mongoose"

export interface InboxSchema {
  name: string
  description?: string
  unreadCount?: number
  messages: string[]
}

export interface InboxDocument
  extends InboxSchema,
    Document,
    SchemaTimestampsConfig {
  description: string
  unreadCount: number
  messages: Types.Array<string>
}

const inboxSchema = new Schema<InboxDocument>(
  {
    name: {
      type: String,
      required: [true, "please specify a name"]
    },
    description: {
      type: String,
      default: ""
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    messages: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
)

export const Inbox: Model<InboxDocument> =
  models.Inbox || model("Inbox", inboxSchema)
