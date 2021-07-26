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

export interface BroadcastSchema {
  message: string
  totalRequested: number
  totalQueued: number
  totalFailed: number
  totalSent: number
  totalDelivered: number
  totalUndelivered: number
  tags?: string[]
  contacts?: Types.ObjectId[]
}

export interface BroadcastDocument
  extends BroadcastSchema,
    Document,
    SchemaTimestampsConfig {
  tags: Types.Array<string>
  contacts: Types.Array<PopulatedDoc<ContactDocument>>
}

const broadcastSchema = new Schema<BroadcastDocument>(
  {
    message: {
      type: String,
      required: [true, "please specify a message"]
    },
    totalRequested: {
      type: Number,
      required: [true, "please specify the total requested"]
    },
    totalQueued: {
      type: Number,
      required: [true, "please specify the total queued"]
    },
    totalFailed: {
      type: Number,
      required: [true, "please specify the total failed"]
    },
    totalSent: {
      type: Number,
      required: [true, "please specify the total sent"]
    },
    totalDelivered: {
      type: Number,
      required: [true, "please specify the total delivered"]
    },
    totalUndelivered: {
      type: Number,
      required: [true, "please specify the total undelivered"]
    },
    tags: [
      {
        type: String
      }
    ],
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contact"
      }
    ]
  },
  { timestamps: true }
)

export const Broadcast: Model<BroadcastDocument> =
  models.Broadcast || model("Broadcast", broadcastSchema)
