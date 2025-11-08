// --- START OF FIX: Corrected and added all necessary imports ---
const Competitor = require('../models/Competitor');
const ContentStrategy = require('../models/ContentStrategy');
const { getChannelVideos } = require('../services/youtubeService');
const { getTweetsByUsername } = require('../services/twitterCompetitorService');
const { getPostsFromRss } = require('../services/blogCompetitorService');
const { analyzeCompetitorTopics, findContentGaps } = require('../services/aiService');
// --- END OF FIX ---

const addCompetitor = async (req, res) => {
  const { platform, handle } = req.body;

  if (!platform || !handle) {
    return res.status(400).json({ success: false, error: 'Please provide platform and a handle/URL' });
  }

  try {
    let competitorData;
    let existingCompetitorCheck = {};
    let newCompetitorPayload = { platform };

    switch (platform) {
      case 'YouTube':
        competitorData = await getChannelVideos(handle);
        existingCompetitorCheck = { youtubeChannelId: competitorData.channelId };
        newCompetitorPayload.youtubeChannelId = competitorData.channelId;
        newCompetitorPayload.name = competitorData.channelTitle;
        break;
      case 'Twitter':
        competitorData = await getTweetsByUsername(handle);
        existingCompetitorCheck = { twitterHandle: competitorData.twitterHandle };
        newCompetitorPayload.twitterHandle = competitorData.twitterHandle;
        newCompetitorPayload.name = competitorData.name;
        break;
      case 'Blog':
        competitorData = await getPostsFromRss(handle);
        existingCompetitorCheck = { blogRssUrl: competitorData.blogRssUrl };
        newCompetitorPayload.blogRssUrl = competitorData.blogRssUrl;
        newCompetitorPayload.name = competitorData.name;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unsupported platform.' });
    }

    let competitor = await Competitor.findOne({ ...existingCompetitorCheck, user: req.user.id });
    if (competitor) {
      return res.status(400).json({ success: false, error: 'This competitor is already being tracked.' });
    }

    const { recentPosts } = competitorData;
    const postTitles = recentPosts.map(post => post.title);
    const analysis = await analyzeCompetitorTopics(postTitles);
    console.log(`AI Analysis for ${newCompetitorPayload.name}:`, analysis);

    competitor = new Competitor({
      ...newCompetitorPayload,
      user: req.user.id,
      recentPosts,
      topicAnalysis: analysis,
      lastFetched: Date.now(),
    });

    await competitor.save();
    res.status(201).json({ success: true, data: competitor });
  } catch (error) {
    console.error("Error adding competitor:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: competitors.length, data: competitors });
  } catch (error) {
    console.error("Error getting competitors:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const analyzeGaps = async (req, res) => {
  try {
    const competitor = await Competitor.findOne({ _id: req.params.id, user: req.user.id });
    if (!competitor || !competitor.topicAnalysis?.themes?.length) {
      return res.status(404).json({ success: false, error: 'Competitor not found or has no analysis data.' });
    }

    const userStrategies = await ContentStrategy.find({ user: req.user.id }).select('topic');
    const userTopics = userStrategies.map(s => s.topic);

    const gaps = await findContentGaps(competitor.topicAnalysis.themes, userTopics);

    res.status(200).json({ success: true, data: gaps });
  } catch (error) {
    console.error('Error in analyzeGaps controller:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  addCompetitor,
  getCompetitors,
  analyzeGaps,
};