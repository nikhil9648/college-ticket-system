const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Response content is required'],
      trim: true,
      maxlength: [5000, 'Response cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['comment', 'solution', 'internal_note'],
      default: 'comment',
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        url: String,
        mimetype: String,
      },
    ],
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

responseSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Response', responseSchema);
