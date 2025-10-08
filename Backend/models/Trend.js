const mongoose = require('mongoose');

const TrendSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['Twitter', 'YouTube', 'Reddit', 'Google Trends'],
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