const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    suggestedCategory: {
      type: String,
      trim: true,
    },
    suggestedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    suggestedPriority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
    },
    urgencyScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    openaiSolutions: [
      {
        solution: String,
        confidence: Number,
        steps: [String],
      },
    ],
    geminiSolutions: [
      {
        solution: String,
        confidence: Number,
        steps: [String],
      },
    ],
    keywords: [String],
    summary: String,
    rawOpenaiResponse: mongoose.Schema.Types.Mixed,
    rawGeminiResponse: mongoose.Schema.Types.Mixed,
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingError: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
