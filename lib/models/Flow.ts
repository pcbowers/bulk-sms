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
import { TaskDocument } from "./Task"

interface ChosenTaskSchema {
  task?: Types.ObjectId
  parameters?: string[]
}

interface ChosenTaskDocument extends ChosenTaskSchema {
  task: PopulatedDoc<TaskDocument>
  parameters: Types.Array<string>
}

interface StepSchema {
  name?: string
  description?: string
  keywords?: string[]
  inbox?: Types.ObjectId
  tasks?: ChosenTaskSchema[]
}

interface StepDocument extends StepSchema {
  name: string
  description: string
  keywords: Types.Array<string>
  inbox: PopulatedDoc<TaskDocument>
  tasks: Types.Array<ChosenTaskDocument>
}

export interface FlowSchema {
  name: string
  description?: string
  adminOnly?: boolean
  sortOrder?: number
  steps: StepSchema[]
}

export interface FlowDocument
  extends FlowSchema,
    Document,
    SchemaTimestampsConfig {
  description: string
  adminOnly: boolean
  sortOrder: number
  steps: Types.Array<StepDocument>
}

const chosenTaskSchema = new Schema<ChosenTaskDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task"
    },
    parameters: [
      {
        type: String
      }
    ]
  },
  { _id: false }
)

const stepSchema = new Schema<StepDocument>(
  {
    name: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    keywords: [
      {
        type: String
      }
    ],
    inbox: {
      type: Schema.Types.ObjectId,
      ref: "Inbox"
    },
    tasks: [
      {
        type: chosenTaskSchema
      }
    ]
  },
  { _id: false }
)

const flowSchema = new Schema<FlowDocument>(
  {
    name: {
      type: String,
      required: [true, "please specify a name"]
    },
    description: {
      type: String,
      default: ""
    },
    adminOnly: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    steps: [
      {
        type: stepSchema
      }
    ]
  },
  { timestamps: true }
)

export const Flow: Model<FlowDocument> =
  models.Flow || model("Flow", flowSchema)
