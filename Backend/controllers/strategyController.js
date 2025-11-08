const { 
  generateContentStrategy, 
  generateAudiencePersona,
  generateContentIdeas,
  generateExpandedContent
} = require('../services/aiService');
const ContentStrategy = require('../models/ContentStrategy');
const { searchYouTubeByTopic } = require('../services/youtubeService');
const { searchRedditByTopic } = require('../services/redditService');
const { searchTwitterByTopic } = require('../services/twitterService');
const { getGeminiGeneratedTrends } = require('../services/geminiTrendsService');

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
    
    const generatedPlan = await generateContentStrategy(
      audiencePersona,
      topic, 
      goals, 
      trendingKeywords,
      startDate,
      endDate
    );

    const newStrategy = new ContentStrategy({
      user: req.user.id,
      targetAudience,
      audiencePersona,
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
    const strategy = await ContentStrategy.findOne({ _id: req.params.id, user: req.user.id });
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
  const { strategyId, day: originalDayStr } = req.params;
  const { title, format, platform, postTime, status, rationale, day: newDay } = req.body;
  const originalDay = parseInt(originalDayStr);

  try {
    const strategy = await ContentStrategy.findById(strategyId);
    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found.' });
    }

    const originalCalendar = strategy.generatedPlan.calendar;
    const itemToMove = originalCalendar.find(item => item.day === originalDay);

    if (!itemToMove) {
      return res.status(404).json({ success: false, error: 'Calendar item for original day not found.' });
    }

    // --- START OF NEW, SAFER "MOVE AND OVERWRITE" LOGIC ---
    if (newDay && newDay !== originalDay) {
      
      const newCalendar = [];
      // Iterate over the original calendar to build the new one safely
      for (const item of originalCalendar) {
        // If the current item is the one we are dropping ONTO (the target), SKIP it.
        if (item.day === newDay) {
          continue; 
        }
        // If the current item is the one we are moving, update its day and add it.
        if (item.day === originalDay) {
          newCalendar.push({ ...item.toObject(), day: newDay });
        }
        // Otherwise, just add the item as is.
        else {
          newCalendar.push(item);
        }
      }
      strategy.generatedPlan.calendar = newCalendar;
    }
    // --- END OF NEW LOGIC ---

    // Standard Update (editing details without moving)
    else {
      const itemToUpdate = originalCalendar.find(item => item.day === originalDay);
      if (title) itemToUpdate.title = title;
      if (format) itemToUpdate.format = format;
      if (platform) itemToUpdate.platform = platform;
      if (postTime) itemToUpdate.postTime = postTime;
      if (status) itemToUpdate.status = status;
      if (rationale) itemToUpdate.rationale = rationale;
    }

    strategy.markModified('generatedPlan.calendar');
    await strategy.save();

    res.status(200).json({ success: true, data: strategy });

  } catch (error) {
    console.error('Error updating calendar item:', error);
    res.status(500).json({ success: false, error: 'Server Error: Could not update calendar item.' });
  }
};


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

const deleteStrategy = async (req, res) => {
  try {
    const strategy = await ContentStrategy.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!strategy) {
      return res.status(404).json({ success: false, error: 'Strategy not found or you are not authorized to delete it.' });
    }

    await strategy.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not delete strategy.' });
  }
};

const expandIdea = async (req, res) => {
  const { title, format } = req.body;
  if (!title || !format) {
    return res.status(400).json({ success: false, error: 'Please provide a title and format.' });
  }
  try {
    const expandedContent = await generateExpandedContent(title, format);
    res.status(200).json({ success: true, data: expandedContent });
  } catch (error) {
    console.error('Error in expandIdea controller:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  generateStrategy,
  getStrategies,
  getStrategyById,
  updateCalendarItem,
  generatePersona,
  deleteStrategy,
  generateIdeas,
  expandIdea,
};