const { 
  generateContentStrategy, 
  generateAudiencePersona, // <-- IMPORT new function
  generateContentIdeas } = require('../services/aiService');
const ContentStrategy = require('../models/ContentStrategy');
const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { searchTwitterByTopic } = require('../services/twitterService');
const { getGeminiGeneratedTrends } = require('../services/geminiTrendsService');

// --- NEW CONTROLLER for Idea Bank ---
const generateIdeas = async (req, res) => {
  const { topic, type } = req.body;
  if (!topic || !type) {
    return res.status(400).json({ success: false, error: 'Please provide a topic and idea type.' });
  }
  try {
    const ideas = await generateContentIdeas(topic, type);
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not generate ideas.' });
  }
};

const generateStrategy = async (req, res) => {
  const { targetAudience, topic, goals, startDate, endDate } = req.body;

  if (!targetAudience || !topic || !goals) {
    return res.status(400).json({ success: false, error: 'Please provide targetAudience, topic, and goals' });
  }

  try {
    // --- STEP 1: Generate the detailed persona first ---
    console.log(`Generating persona for: ${targetAudience}`);
    const audiencePersona = await generateAudiencePersona(targetAudience);
    console.log('Generated Persona:', audiencePersona);

    console.log(`Fetching trends for topic: ${topic}`);
    const trendSources = await Promise.all([
      searchYouTubeByTopic(topic),
      searchRedditByTopic(topic),
      searchTwitterByTopic(topic),
      getGeminiGeneratedTrends(topic),
    ]);
    
    const trendingKeywords = trendSources.flat().map(trend => trend.keyword).slice(0, 10);
    console.log(`Found trending keywords:`, trendingKeywords);
    
    // --- STEP 2: Use the detailed persona to generate the strategy ---
    const generatedPlan = await generateContentStrategy(
      audiencePersona, // <-- Use the detailed persona
      topic, 
      goals, 
      trendingKeywords,
      startDate,
      endDate
    );

    const newStrategy = new ContentStrategy({
      user: req.user.id,
      targetAudience, // Still save the user's original input
      audiencePersona, // <-- Save the generated persona
      topic,
      goals,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      generatedPlan,
    });

    const savedStrategy = await newStrategy.save();

    res.status(201).json({ success: true, data: savedStrategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not generate strategy.' });
  }
};

const getStrategies = async (req, res) => {
  try {
    const strategies = await ContentStrategy.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: strategies.length, data: strategies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not fetch strategies.' });
  }
};

const getStrategyById = async (req, res) => {
  try {
    const strategy = await ContentStrategy.findOne({ _id: req.params.id, user: req.user.id });;
    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found or you are not authorized to view it.' });
    }
    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not fetch strategy.' });
  }
};

const updateCalendarItem = async (req, res) => {
  const { strategyId, day } = req.params;
  const { title, format, platform, postTime, status, rationale } = req.body;
  try {
    const strategy = await ContentStrategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found.' });
    }
    const calendarItem = strategy.generatedPlan.calendar.find(item => item.day == day);
    if (!calendarItem) {
      return res.status(404).json({ success: false, error: 'Calendar item not found for that day.' });
    }
    if (title) calendarItem.title = title;
    if (format) calendarItem.format = format;
    if (platform) calendarItem.platform = platform;
    if (postTime) calendarItem.postTime = postTime;
    if (status) calendarItem.status = status;
    if (rationale) calendarItem.rationale = rationale; // Allow updating rationale
    await strategy.save();
    res.status(200).json({ success: true, data: strategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not update calendar item.' });
  }
};

// --- NEW: Controller for persona generation on its own ---
const generatePersona = async (req, res) => {
  const { audience } = req.body;
  if (!audience) {
    return res.status(400).json({ success: false, error: 'Please provide audience keywords.' });
  }
  try {
    const persona = await generateAudiencePersona(audience);
    res.status(200).json({ success: true, data: persona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not generate persona.' });
  }
};

// --- NEW: Function to delete a strategy ---
const deleteStrategy = async (req, res) => {
  try {
    // Find the strategy by its ID and ensure it belongs to the logged-in user
    const strategy = await ContentStrategy.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found or you are not authorized to delete it.' });
    }

    await strategy.deleteOne(); // Mongoose v6+ uses deleteOne() on the document

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not delete strategy.' });
  }
};


module.exports = {
  generateIdeas,
  generateStrategy,
  getStrategies,
  getStrategyById,
  updateCalendarItem,
  generatePersona, // <-- Export new controller
  deleteStrategy,
};