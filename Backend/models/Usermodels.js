import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    phone: { type: String, default: "" },
    role: { type: String, enum: ['admin', 'editor', 'freelancer', 'client'], default: 'freelancer' },
    adminWalletBalance: { type: Number, default: 0, min: 0 },
    editorPendingBalance: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    document: { type: String },
    token: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null }

}, { timestamps: true })

export const User = mongoose.model("User", userSchema)