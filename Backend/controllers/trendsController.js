const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { getGoogleRelatedTopics } = require('../services/googleTrendsService');

// @desc    Fetch real-time trends from multiple platforms based on a topic
// @route   GET /api/trends?topic=your_topic_here
// @access  Public
const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ success: false, error: 'Please provide a topic as a query parameter (e.g., ?topic=skincare).' });
  }

  try {
    // Fetch trends from all sources concurrently with the provided topic
    const [youtubeTrends, redditTrends, googleTrends] = await Promise.all([
      searchYouTubeByTopic(topic),
      searchRedditByTopic(topic), // Use the new search function
      getGoogleRelatedTopics(topic),
    ]);

    // Combine all trends into a single array
    const allTrends = [...youtubeTrends, ...redditTrends, ...googleTrends];

    if (allTrends.length === 0) {
      return res.status(404).json({ success: true, message: `Could not find any trends for the topic: "${topic}"` });
    }

    res.status(200).json({ success: true, count: allTrends.length, data: allTrends });
  } catch (error) {
    console.error('Error in getTrends controller:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getTrends,
};