import mongoose from "mongoose";

const progressStages = [
  "Video Pending",
  "Editing Started",
  "Raw Footage & Voiceover Arranging",
  "Basic Cuts Done",
  "Transitions Added",
  "Color Grading",
  "Text & Captions",
  "Sound Design",
  "First Draft Ready",
  "Waiting for Client Review",
  "Revision 1 Requested",
  "Revision 1 Completed",
  "Revision 2 Requested",
  "Revision 2 Completed",
  "Final Export Ready",
  "Final Video Delivered",
  "Completed",
];

const projectOrderSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedEditorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    projectTitle: { type: String, required: true, trim: true },
    videoType: {
      type: String,
      enum: ["YouTube Video", "Short", "Reel", "Podcast", "Ad", "Other"],
      required: true,
    },
    videoDuration: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    editingStyle: {
      type: String,
      enum: ["Cinematic", "Fast-paced", "Vlog style", "Documentary", "Social Media viral style", "Other"],
      required: true,
    },
    editingStyleOther: { type: String, trim: true, default: "" },
    requirements: [{ type: String }],
    instructions: { type: String, required: true, trim: true },
    rawFootageLink: { type: String, required: true, trim: true },
    voiceoverLink: { type: String, trim: true, default: "" },
    musicLinks: [{ type: String }],
    scriptLink: { type: String, trim: true, default: "" },
    referenceLinks: [{ type: String }],
    revisionPolicyAgreed: { type: Boolean, required: true, default: false },
    maxRevisions: { type: Number, default: 2 },
    priorityLevel: { type: String, enum: ["Normal", "Urgent"], default: "Normal" },
    autoPriceEstimate: { type: Number, default: 0 },
    progressStage: { type: String, enum: progressStages, default: "Video Pending" },
  },
  { timestamps: true }
);

export { progressStages };
const ProjectOrder = mongoose.models.ProjectOrder || mongoose.model("ProjectOrder", projectOrderSchema);
export default ProjectOrder;
