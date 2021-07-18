import mongoose from "mongoose"

const BroadcastSchema = new mongoose.Schema(
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
    tags: {
      type: [String],
      default: []
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contact"
      }
    ]
  },
  { timestamps: true }
)

export const Broadcast =
  mongoose.models.Broadcast || mongoose.model("Broadcast", BroadcastSchema)
