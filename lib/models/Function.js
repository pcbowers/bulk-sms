import mongoose from "mongoose"

const FunctionSchema = new mongoose.Schema(
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

export const Function =
  mongoose.models.Function || mongoose.model("Function", FunctionSchema)
