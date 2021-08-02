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
      required: [true, "please specify a message"],
      cast: false
    },
    totalRequested: {
      type: Number,
      required: [true, "please specify the total requested"],
      cast: false
    },
    totalQueued: {
      type: Number,
      required: [true, "please specify the total queued"],
      cast: false
    },
    totalFailed: {
      type: Number,
      required: [true, "please specify the total failed"],
      cast: false
    },
    totalSent: {
      type: Number,
      required: [true, "please specify the total sent"],
      cast: false
    },
    totalDelivered: {
      type: Number,
      required: [true, "please specify the total delivered"],
      cast: false
    },
    totalUndelivered: {
      type: Number,
      required: [true, "please specify the total undelivered"],
      cast: false
    },
    tags: [
      {
        type: String,
        cast: false
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
