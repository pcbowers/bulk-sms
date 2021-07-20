import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig
} from "mongoose"

export interface FunctionSchema extends Document {
  name: string
  description?: string
  numParameters: number
}

export interface FunctionDocument
  extends FunctionSchema,
    SchemaTimestampsConfig {
  description: string
}

const functionSchema = new Schema<FunctionDocument>(
  {
    name: {
      type: String,
      required: [true, "please specify a name"]
    },
    description: {
      type: String,
      default: ""
    },
    numParameters: {
      type: Number,
      required: [true, "please specify the number of parameters"]
    }
  },
  { timestamps: true }
)

export const Function: Model<FunctionDocument> =
  models.Function || model("Function", functionSchema)
