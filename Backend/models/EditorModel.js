import mongoose from "mongoose";

const EditorSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true
    },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    rate: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["Available", "Busy", "Away"], 
      default: "Available" 
    },
    experience: { type: String, required: true },
    skills: { type: [String], required: true }, 
    bio: { type: String, required: true },
  },
  { timestamps: true }
);

const Editor = mongoose.models.Editor || mongoose.model("Editor", EditorSchema);
export default Editor;