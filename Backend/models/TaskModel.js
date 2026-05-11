import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    assignedEditorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    details: { type: String, trim: true, default: "" },
    timerStatus: { type: String, enum: ["not_started", "running", "paused", "completed"], default: "not_started" },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    elapsedSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
