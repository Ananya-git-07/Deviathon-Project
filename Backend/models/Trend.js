const mongoose = require('mongoose');

const TrendSchema = new mongoose.Schema({
  keyword: { // This will now be the title of the content
    type: String,
    required: true,
    trim: true,
  },
  // --- NEW: Add a field for the direct link ---
  link: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['Twitter', 'YouTube', 'Reddit', 'Google Trends (AI)'],
  },
  industry: {
    type: String,
    trim: true,
  },
  sentiment: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral'],
    default: 'Neutral',
  },
  discoveredAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trend', TrendSchema);