const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  postId: { type: String, required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  publishedAt: { type: Date, required: true },
  format: { type: String, default: 'Video' }, // e.g., 'Video', 'Tweet', 'Article'
});

const CompetitorSchema = new mongoose.Schema({
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
  // The unique identifier, like a YouTube Channel ID or Twitter username
  handle: {
    type: String,
    required: true,
    unique: true,
  },
  lastFetched: {
    type: Date,
  },
  recentPosts: [PostSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Competitor', CompetitorSchema);