import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, trim: true, default: "" },
    actorRole: { type: String, trim: true, default: "" },
    action: {
      type: String,
      enum: [
        "project_created",
        "project_published",
        "application_submitted",
        "editor_hired",
        "progress_updated",
        "submission_uploaded",
        "revision_requested",
        "delivery_confirmed",
        "project_completed",
        "review_submitted",
        "comment_added",
      ],
      required: true,
    },
    details: { type: String, trim: true, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ProjectActivity =
  mongoose.models.ProjectActivity || mongoose.model("ProjectActivity", activitySchema);
export default ProjectActivity;
