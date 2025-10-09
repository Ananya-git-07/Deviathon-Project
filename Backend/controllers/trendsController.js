const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { searchTwitterByTopic } = require('../services/twitterService');
const { getGeminiGeneratedTrends } = require('../services/geminiTrendsService'); // <-- IMPORT THE NEW SERVICE

const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ success: false, error: 'Please provide a topic as a query parameter.' });
  }

  try {
    // Fetch trends from all sources concurrently, using Gemini for Google Trends
    const [youtubeTrends, redditTrends, twitterTrends, geminiTrends] = await Promise.all([
      searchYouTubeByTopic(topic),
      searchRedditByTopic(topic),
      searchTwitterByTopic(topic),
      getGeminiGeneratedTrends(topic), // <-- USE THE NEW SERVICE
    ]);

    // Combine all trends into a single array
    const allTrends = [...youtubeTrends, ...redditTrends, ...twitterTrends, ...geminiTrends];

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