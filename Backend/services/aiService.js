const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a content strategy using Google's Gemini model.
 * @param {string} targetAudience - The target audience for the content.
 * @param {string} topic - The primary topic or industry (e.g., "skincare").
 * @param {string} goals - The main objectives (e.g., "engagement and UGC").
 * @returns {Promise<object>} - The AI-generated strategy plan.
 */
const generateContentStrategy = async (targetAudience, topic, goals) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // A fast and capable model
    generationConfig: {
      responseMimeType: 'application/json', // Enable JSON output mode
    },
  });

  // A detailed prompt engineered for Gemini's JSON mode.
  const prompt = `
    You are an expert content strategist AI. Your task is to generate a complete 30-day content strategy plan based on the user's requirements.

    User Requirements:
    - Target Audience: ${targetAudience}
    - Primary Topic/Industry: ${topic}
    - Core Goals: ${goals}

    Generate a content strategy. The output MUST be a valid JSON object with the exact structure I provide below. Do not add any extra text or markdown formatting.

    The JSON structure:
    {
      "blogTitle": "A catchy, SEO-friendly blog title related to the topic.",
      "suggestedFormats": ["An array of 2-3 recommended content formats, like 'IG Reels', 'YouTube Shorts', 'Blog Post', 'Twitter Thread'."],
      "postFrequency": "A recommended weekly post frequency, like '3 posts/week'.",
      "calendar": [
        {
          "day": 1,
          "title": "A specific content title for Day 1.",
          "format": "The format for Day 1's content (must be one of the suggestedFormats).",
          "platform": "The best platform for this post (e.g., 'Instagram', 'YouTube', 'Blog').",
          "postTime": "The optimal post time (e.g., '9-11 AM EST')."
        }
      ]
    }

    Instructions for the calendar:
    - Create a plan for a full 30 days.
    - Vary the content titles and formats to keep the audience engaged.
    - Ensure the content ideas align with the target audience and goals.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const strategyJson = JSON.parse(response.text());

    return strategyJson;
  } catch (error) {
    console.error('Error communicating with Google Gemini API:', error);
    throw new Error('Failed to generate AI content strategy.');
  }
};

module.exports = {
  generateContentStrategy,
};