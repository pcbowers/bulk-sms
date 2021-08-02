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
        type: String,
        cast: false
      }
    ]
  },
  { timestamps: true }
)

export const Inbox: Model<InboxDocument> =
  models.Inbox || model("Inbox", inboxSchema)
