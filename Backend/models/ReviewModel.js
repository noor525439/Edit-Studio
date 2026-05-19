import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    editorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, trim: true, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectOrder" },
    clientName: { type: String, trim: true, default: "" },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ projectId: 1, clientId: 1 }, { unique: true, sparse: true });
reviewSchema.index({ orderId: 1, clientId: 1 }, { unique: true, sparse: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
