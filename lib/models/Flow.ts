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
import { FunctionDocument } from "./Function"

interface ParameterSchema {
  type: string
  body?: string
}

interface ParameterDocument extends ParameterSchema {
  body: string
}

interface ChosenFunctionSchema {
  function?: Types.ObjectId[]
  parameters?: ParameterSchema[]
}

interface ChosenFunctionDocument extends ChosenFunctionSchema {
  function: Types.Array<PopulatedDoc<FunctionDocument>>
  parameters: Types.Array<ParameterDocument>
}

interface StepSchema {
  keywordPresent: boolean
  keywords?: string[]
  variableBody: boolean
  functions?: ChosenFunctionSchema[]
}

interface StepDocument extends StepSchema {
  keywords: Types.Array<string>
  functions: Types.Array<ChosenFunctionDocument>
}

export interface FlowSchema extends Document {
  name: string
  description?: string
  adminOnly?: boolean
  index?: number
  steps: StepSchema[]
}

export interface FlowDocument extends FlowSchema, SchemaTimestampsConfig {
  description: string
  adminOnly: boolean
  index: number
  steps: Types.Array<StepDocument>
}

const parameterSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "please speicfy a type (variableBody, fixedBody"]
    },
    body: {
      type: String,
      default: ""
    }
  },
  { _id: false }
)

const chosenFunctionSchema = new Schema(
  {
    function: {
      type: Schema.Types.ObjectId,
      ref: "Function"
    },
    parameters: [
      {
        type: parameterSchema
      }
    ]
  },
  { _id: false }
)

const stepSchema = new Schema(
  {
    keywordPresent: {
      type: Boolean,
      required: [true, "please indicate whether a keyword is necessary"]
    },
    keywords: [
      {
        type: String
      }
    ],
    variableBody: {
      type: Boolean,
      required: [true, "please indicate whether a variable body is present"]
    },
    functions: [
      {
        type: chosenFunctionSchema
      }
    ]
  },
  { _id: false }
)

const flowSchema = new Schema(
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
    index: {
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
