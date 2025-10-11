const mongoose = require('mongoose');

const ContentStrategySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  targetAudience: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  goals: {
    type: String,
    required: true,
  },
  // --- NEW: Store the AI-generated persona ---
  audiencePersona: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  generatedPlan: {
    blogTitle: String,
    suggestedFormats: [String],
    postFrequency: String,
    calendar: [{
      day: Number,
      title: String,
      format: String,
      platform: String,
      postTime: String,
      status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'],
        default: 'To Do',
      },
      // --- NEW: Add a field for the AI's reasoning ---
      rationale: {
        type: String,
        default: 'Generated based on initial strategy parameters.',
      },
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ContentStrategy', ContentStrategySchema);