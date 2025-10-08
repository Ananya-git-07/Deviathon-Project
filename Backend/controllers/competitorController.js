const Competitor = require('../models/Competitor');
const { getChannelVideos } = require('../services/youtubeService');

const addCompetitor = async (req, res) => {
  const { platform, handle } = req.body;

  if (!platform || !handle) {
    return res.status(400).json({ success: false, error: 'Please provide platform and handle' });
  }
  if (platform !== 'YouTube') {
    return res.status(400).json({ success: false, error: 'Currently, only YouTube tracking is supported.' });
  }

  try {
    // Fetch initial data from the YouTube API
    const { channelId, channelTitle, recentPosts } = await getChannelVideos(handle);

    // Check if a competitor with this channel ID already exists
    let competitor = await Competitor.findOne({ handle: channelId });
    if (competitor) {
      return res.status(400).json({ success: false, error: 'This competitor is already being tracked.' });
    }

    competitor = new Competitor({
      name: channelTitle, // Use the official channel name from the API
      platform,
      handle: channelId, // Store the more reliable channel ID
      recentPosts,
      lastFetched: Date.now(),
    });

    await competitor.save();
    res.status(201).json({ success: true, data: competitor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: competitors.length, data: competitors });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = { addCompetitor, getCompetitors };