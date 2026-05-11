import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "file"],
      default: "image",
    },
    originalName: {
      type: String,
      default: "",
    },
    size: {
      type: Number, // bytes
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Upload = mongoose.model("Upload", uploadSchema);