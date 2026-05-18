import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;
