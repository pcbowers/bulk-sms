import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig,
  Types
} from "mongoose"

export interface ContactSchema extends Document {
  phoneNumber: string
  name?: string
  email?: string
  admin: boolean
  twilioBindingId: string
  twilioAccountId: string
  twilioIdentity: string
  tags?: string[]
}

export interface ContactDocument extends ContactSchema, SchemaTimestampsConfig {
  tags: Types.Array<string>
  name: string
  email: string
}

const contactSchema = new Schema<ContactDocument>(
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
    tags: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
)

export const Contact: Model<ContactDocument> =
  models.Contact || model("Contact", contactSchema)
