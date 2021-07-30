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
  phoneNumber?: string
  name?: string
  email?: string
  admin?: boolean
  twilioBindingId?: string
  twilioIdentity?: string
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
      sparse: true
    },
    name: {
      type: String,
      default: ""
    },
    email: {
      type: String,
      unique: true,
      sparse: true
    },
    admin: {
      type: Boolean,
      default: false
    },
    twilioBindingId: {
      type: String
    },
    twilioIdentity: {
      type: String
    },
    tags: [
      {
        type: String
      }
    ]
  },
  { timestamps: true }
)

contactSchema.pre("save", (next) => {
  console.log(this)
  console.log("hi, this is pre save!")
  next()
})

export const Contact: Model<ContactDocument> =
  models.Contact || model("Contact", contactSchema)
