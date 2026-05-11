import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectOrder", 
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    editorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeCheckoutSessionId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "pkr",
      lowercase: true,
    },
    method: {
      type: String,
      enum: ["stripe_card", "stripe_checkout", "JazzCash", "Easypaisa", "Card"],
      default: "stripe_card",
    },

  
    adminCommissionPercent: {
      type: Number,
      default: 20,
    },
    adminCommissionAmount: {
      type: Number,
      default: 0,
    },
    editorPayoutAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },

    receiptUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ clientId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeCheckoutSessionId: 1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;