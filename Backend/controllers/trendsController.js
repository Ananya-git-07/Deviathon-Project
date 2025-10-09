const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { getGoogleRelatedTopics } = require('../services/googleTrendsService');
const { searchTwitterByTopic } = require('../services/twitterService'); // <-- ADD THIS

const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ success: false, error: 'Please provide a topic as a query parameter.' });
  }

  try {
    // Fetch trends from all sources concurrently
    const [youtubeTrends, redditTrends, googleTrends, twitterTrends] = await Promise.all([ // <-- ADD twitterTrends
      searchYouTubeByTopic(topic),
      searchRedditByTopic(topic),
      getGoogleRelatedTopics(topic),
      searchTwitterByTopic(topic), // <-- ADD THIS CALL
    ]);

    // Combine all trends into a single array
    const allTrends = [...youtubeTrends, ...redditTrends, ...googleTrends, ...twitterTrends]; // <-- ADD twitterTrends

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