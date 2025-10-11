const Competitor = require('../models/Competitor');
const { getChannelVideos } = require('../services/youtubeService');
const { getTweetsByUsername } = require('../services/twitterCompetitorService');
const { getPostsFromRss } = require('../services/blogCompetitorService');
const { analyzeCompetitorTopics } = require('../services/aiService');

const addCompetitor = async (req, res) => {
  const { platform, handle } = req.body;

  if (!platform || !handle) {
    return res.status(400).json({ success: false, error: 'Please provide platform and a handle/URL' });
  }

  try {
    let competitorData;
    let existingCompetitorCheck = {};
    let newCompetitorPayload = { platform };

    // Step 1: Fetch data from the external source based on platform
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

    // Step 2: Check if this competitor is already tracked for THIS USER
   let competitor = await Competitor.findOne({ ...existingCompetitorCheck, user: req.user.id });
    if (competitor) {
      return res.status(400).json({ success: false, error: 'This competitor is already being tracked.' });
    }
    // Step 3: Analyze topics and create the new competitor
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
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCompetitors = async (req, res) => {
  try {
    const competitors = await Competitor.find({ user: req.user.id }).sort({ createdAt: -1 }); // <-- Filter by user
    res.status(200).json({ success: true, count: competitors.length, data: competitors });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = { addCompetitor, getCompetitors };