import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

export const Section = mongoose.model("Section", SectionSchema)