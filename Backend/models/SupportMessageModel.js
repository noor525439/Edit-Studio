import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: {
      type: String,
      required: true,
      trim: true
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    senderRole: {
      type: String,
      enum: ['client', 'editor', 'admin'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: [
      {
        filename: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    replies: [
      {
        replyBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        replyByRole: String,
        replyMessage: String,
        attachments: [
          {
            filename: String,
            fileUrl: String,
            fileType: String
          }
        ],
        replyedAt: {
          type: Date,
          default: Date.now
        },
        isRead: {
          type: Boolean,
          default: false
        }
      }
    ],
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open'
    },
    isReadByUser: {
      type: Boolean,
      default: false
    },
    isReadByAdmin: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    lastUpdatedBy: {
      type: String,
      enum: ['user', 'admin']
    },
    readReceiptTimestamp: Date
  },
  {
    timestamps: true
  }
);

// Index for faster queries
supportMessageSchema.index({ userId: 1, createdAt: -1 });
supportMessageSchema.index({ status: 1, isReadByAdmin: 1 });

export default mongoose.model('SupportMessage', supportMessageSchema);
