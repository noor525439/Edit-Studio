import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: [
          "project_published",
          "instant_hire",
          "application_received",
          "application_accepted",
          "progress_updated",
          "submission_received",
          "revision_requested",
          "delivery_confirmed",
          "project_completed",
          "milestone_created",
          "milestone_released",
          "payment_completed",
          "payment_received",
          "payment_released",  
          "support_message",
          "support_reply",
          "admin_reply",
          "support_update",
      ],
      required: true,
    },
    link: { type: String, default: null },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;