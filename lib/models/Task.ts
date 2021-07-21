import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig
} from "mongoose"

export interface TaskSchema extends Document {
  name: string
  description?: string
  numParameters: number
}

export interface TaskDocument
  extends TaskSchema,
    SchemaTimestampsConfig {
  description: string
}

const taskSchema = new Schema<TaskDocument>(
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

export const Task: Model<TaskDocument> =
  models.Task || model("Task", taskSchema)
