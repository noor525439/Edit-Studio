import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ProjectComment =
  mongoose.models.ProjectComment || mongoose.model("ProjectComment", commentSchema);
export default ProjectComment;
