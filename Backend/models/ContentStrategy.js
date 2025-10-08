const mongoose = require('mongoose');

const ContentStrategySchema = new mongoose.Schema({
  targetAudience: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  goals: {
    type: String, // e.g., "engagement and UGC"
    required: true,
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
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ContentStrategy', ContentStrategySchema);