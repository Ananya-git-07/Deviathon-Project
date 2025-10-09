const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiGeneratedTrends = async (topic) => {
  if (!topic) return [];

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // This prompt is engineered to get a structured, high-quality response.
  const prompt = `
    You are an expert trend analysis AI. Your task is to generate a list of plausible trending search queries related to a given topic.

    Based on the topic "${topic}", generate a list of 10 related search queries that a user might search for on Google.
    Include a mix of:
    1.  **Top Queries:** Broad, popular, and consistently searched terms (e.g., "skincare routine").
    2.  **Rising Queries:** More specific, newer, or breakout terms (e.g., "retinol sandwich method").

    The output MUST be a valid JSON object with a single key "trends", which is an array of strings. Do not include any other text, explanations, or markdown formatting.

    Example for topic "coffee":
    {
      "trends": [
        "best coffee beans",
        "how to make cold brew",
        "espresso machine reviews",
        "dalgana coffee recipe",
        "mushroom coffee benefits",
        "local coffee shops near me",
        "fair trade coffee brands",
        "coffee subscription box",
        "is coffee good for you",
        "proffee trend"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedJson = JSON.parse(response.text());

    // Map the array of strings into our application's standard format
    const trends = generatedJson.trends.map(keyword => ({
      keyword: keyword,
      platform: 'Google Trends (AI)', // We label it clearly to show its source
      industry: topic,
    }));

    return trends;

  } catch (error) {
    console.error('Error generating trends with Gemini:', error);
    return [];
  }
};

module.exports = { getGeminiGeneratedTrends };