import mongoose from "mongoose"

const ParameterSchema = new mongoose.Schema(
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

const ChosenFunctionSchema = new mongoose.Schema(
  {
    function: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Function"
    },
    parameters: {
      type: [ParameterSchema],
      default: []
    }
  },
  { _id: false }
)

const StepSchema = new mongoose.Schema(
  {
    keywordPresent: {
      type: Boolean,
      required: [true, "please indicate whether a keyword is necessary"]
    },
    keywords: {
      type: [String],
      default: []
    },
    variableBody: {
      type: Boolean,
      required: [true, "please indicate whether a variable body is present"]
    },
    functions: {
      type: [ChosenFunctionSchema],
      default: []
    }
  },
  { _id: false }
)

const FlowSchema = new mongoose.Schema(
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
      required: [true, "please specify a priority index"]
    },
    steps: {
      type: [StepSchema],
      default: []
    }
  },
  { timestamps: true }
)

export const Flow = mongoose.models.Flow || mongoose.model("Flow", FlowSchema)
