import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ orderId: 1, editorId: 1 }, { unique: true });

const ProjectApplication =
  mongoose.models.ProjectApplication ||
  mongoose.model("ProjectApplication", applicationSchema);
export default ProjectApplication;
