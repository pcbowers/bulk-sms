import {
  Document,
  model,
  Model,
  models,
  Schema,
  SchemaTimestampsConfig
} from "mongoose"

export interface TaskSchema {
  name: string
  description?: string
  numParameters: number
}

export interface TaskDocument
  extends TaskSchema,
    Document,
    SchemaTimestampsConfig {
  description: string
}

const taskSchema = new Schema<TaskDocument>(
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
    numParameters: {
      type: Number,
      required: [true, "please specify the number of parameters"],
      cast: false
    }
  },
  { timestamps: true }
)

export const Task: Model<TaskDocument> =
  models.Task || model("Task", taskSchema)
