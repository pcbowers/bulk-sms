import mongoose from "mongoose"

const ContactSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, "please specify a phone number"]
    },
    name: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    admin: {
      type: Boolean,
      default: false
    },
    twilioBindingId: {
      type: String,
      required: [true, "please specify a twilio binding id"]
    },
    twilioAccountId: {
      type: String,
      required: [true, "please specify a twilio account id"]
    },
    twilioIdentity: {
      type: String,
      required: [true, "please specify a twilio identity"]
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
)

export const Contact =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema)
