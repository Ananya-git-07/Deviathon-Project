const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  format: { type: String, default: 'Video' },
});

const CompetitorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['YouTube', 'Twitter', 'Blog'],
  },
  // --- UPDATED: Replaced 'handle' with platform-specific identifiers ---
  youtubeChannelId: {
    type: String,
    sparse: true, // Allows multiple nulls, but unique if present
    unique: true,
  },
  twitterHandle: {
    type: String,
    sparse: true,
    unique: true,
  },
  blogRssUrl: {
    type: String,
    sparse: true,
    unique: true,
  },
  lastFetched: {
    type: Date,
  },
  recentPosts: [PostSchema],
  
  topicAnalysis: {
    themes: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Competitor', CompetitorSchema);