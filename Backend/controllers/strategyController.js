const { generateContentStrategy } = require('../services/aiService');
const ContentStrategy = require('../models/ContentStrategy');

const generateStrategy = async (req, res) => {
  const { targetAudience, topic, goals } = req.body;

  if (!targetAudience || !topic || !goals) {
    return res.status(400).json({
      success: false,
      error: 'Please provide targetAudience, topic, and goals',
    });
  }

  try {
    // 1. Call the AI service to get the generated plan
    const generatedPlan = await generateContentStrategy(targetAudience, topic, goals);

    // 2. Create a new document using our Mongoose model
    const newStrategy = new ContentStrategy({
      targetAudience,
      topic,
      goals,
      generatedPlan, // The entire JSON object from the AI
    });

    // 3. Save the strategy to the database
    const savedStrategy = await newStrategy.save();

    res.status(201).json({ success: true, data: savedStrategy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error: Could not generate strategy.' });
  }
};

module.exports = {
  generateStrategy,
};