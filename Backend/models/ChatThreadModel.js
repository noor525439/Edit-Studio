import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    thumbnailUrl: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, trim: true, default: "" },
    attachments: { type: [attachmentSchema], default: [] },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const chatThreadSchema = new mongoose.Schema(
  {
    participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    messages: [chatMessageSchema],
    lastReadAtByUser: {
      type: Map,
      of: Date,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

const ChatThread = mongoose.models.ChatThread || mongoose.model("ChatThread", chatThreadSchema);
export default ChatThread;
