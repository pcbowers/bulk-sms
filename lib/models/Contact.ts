import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig,
  Types
} from "mongoose"

export interface ContactSchema {
  phoneNumber: string
  name?: string
  email?: string
  admin?: boolean
  twilioBindingId: string
  twilioIdentity: string
  tags?: string[]
}

export interface ContactDocument
  extends ContactSchema,
    Document,
    SchemaTimestampsConfig {
  tags: Types.Array<string>
  admin: boolean
  name: string
}

const contactSchema = new Schema<ContactDocument>(
  {
    phoneNumber: {
      type: String,
      unique: true,
      required: [true, "please provide a phone Number."],
      cast: false
    },
    name: {
      type: String,
      default: "",
      cast: false
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      cast: false
    },
    admin: {
      type: Boolean,
      default: false,
      cast: false
    },
    twilioBindingId: {
      type: String,
      required: [true, "please provide a twilioBindingId."],
      cast: false
    },
    twilioIdentity: {
      type: String,
      required: [true, "please provide a twilioBindingId."],
      cast: false
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
