const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * --- NEW: Generates a detailed audience persona from keywords ---
 * @param {string} audienceKeywords - A short description or keywords from the user.
 * @returns {Promise<string>} - A detailed, markdown-formatted persona description.
 */
const generateAudiencePersona = async (audienceKeywords) => {
  if (!audienceKeywords) {
    return "No audience specified.";
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are an expert marketing strategist. Based on the following user-provided description of a target audience, generate a detailed and actionable user persona.

    User Input: "${audienceKeywords}"

    Your generated persona should be well-structured and include the following sections in markdown format:
    - **Name & Archetype:** A fictional name and a descriptive archetype (e.g., "Alex the Ambitious Founder").
    - **Demographics:** A brief overview of age, location, and profession.
    - **Goals & Motivations:** What are their primary objectives and what drives them?
    - **Pain Points & Challenges:** What problems are they trying to solve?
    - **Content Preferences:** What kind of content do they consume and on which platforms?

    Keep the entire description concise, under 200 words.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating audience persona with Gemini:', error);
    // Fallback to the original keywords if AI fails
    return `**Audience:** ${audienceKeywords}\n\n*AI persona generation failed. Using the provided description directly.*`;
  }
};


/**
 * Analyzes a list of video titles to identify content themes and strategy.
 * @param {string[]} postTitles - An array of video titles from a competitor.
 * @returns {Promise<object>} - An object with themes and a summary.
 */
const analyzeCompetitorTopics = async (postTitles) => {
  if (!postTitles || postTitles.length === 0) {
    return { themes: [], summary: 'Not enough data to analyze.' };
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  const prompt = `You are an expert YouTube content analyst. Based on the following list of recent video titles from a single channel, please perform an analysis. Video Titles:\n- ${postTitles.join('\n- ')}\n\nYour Tasks:\n1. Identify the top 3 to 5 recurring content pillars or themes.\n2. Provide a concise, one-sentence summary of this channel's overall content strategy.\n\nThe output MUST be a valid JSON object with the exact structure below. Do not add any other text.\n{\n  "themes": ["Theme 1", "Theme 2", "Theme 3"],\n  "summary": "This channel focuses on..."\n}`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Error analyzing competitor topics with Gemini:', error);
    return { themes: [], summary: 'AI analysis failed.' };
  }
};


/**
 * Generates a content strategy using Google's Gemini model.
 * @param {string} audiencePersona - The AI-generated detailed target audience persona.
 * @param {string} topic - The primary topic or industry.
 * @param {string} goals - The main objectives.
 * @param {string[]} trendingKeywords - An array of current trending keywords.
 * @param {string | null} startDate - The optional start date for the plan.
 * @param {string | null} endDate - The optional end date for the plan.
 * @returns {Promise<object>} - The AI-generated strategy plan.
 */
const generateContentStrategy = async (audiencePersona, topic, goals, trendingKeywords = [], startDate = null, endDate = null) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });

  let durationPromptSection = 'Generate a complete 30-day content strategy plan.';
  let planDuration = 30;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    planDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (planDuration > 0 && planDuration <= 90) { 
      durationPromptSection = `Generate a content strategy plan for the period from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. The plan must cover all ${planDuration} days.`;
    } else if (planDuration > 90) {
      planDuration = 90;
      durationPromptSection = `Generate a 90-day content strategy plan. The user requested a longer period, but we are capping it at 90 days.`;
    }
  }
  
  const trendsPromptSection = trendingKeywords.length > 0 
    ? `In addition, to make the strategy highly relevant, consider incorporating some of these currently trending topics and titles related to "${topic}":\n- ${trendingKeywords.join('\n- ')}\nIt is not necessary to use all of them, but the plan should reflect these current interests where appropriate.`
    : '';

  // --- UPDATED PROMPT: Added 'rationale' field and uses the detailed persona ---
  const prompt = `
    You are an expert content strategist AI. Your task is to generate a content strategy based on the user's requirements.

    ${durationPromptSection}

    User Requirements:
    - Target Audience Persona: ${audiencePersona}
    - Primary Topic/Industry: ${topic}
    - Core Goals: ${goals}
    ${trendsPromptSection}
    
    The output MUST be a valid JSON object with the exact structure I provide below.

    The JSON structure:
    {
      "blogTitle": "A catchy, SEO-friendly blog title related to the topic.",
      "suggestedFormats": ["An array of 2-3 recommended content formats like 'IG Reel' or 'Blog Post'."],
      "postFrequency": "A recommended weekly post frequency, like '3 posts/week'.",
      "calendar": [
        {
          "day": 1,
          "title": "A specific content title for Day 1.",
          "format": "The format for Day 1's content (must be one of the suggestedFormats).",
          "platform": "The best platform for this post (e.g., 'Instagram', 'YouTube', 'Blog').",
          "postTime": "The optimal post time (e.g., '9-11 AM EST').",
          "rationale": "A concise, one-sentence explanation for WHY this content is a good idea. For example: 'This addresses a common pain point from the persona and leverages the current trend of [Trend Name].'"
        }
      ]
    }

    Instructions for the calendar:
    - Create a plan for the full duration requested (${planDuration} days).
    - Ensure the 'day' property in the calendar array goes from 1 to ${planDuration}.
    - The 'rationale' MUST be included for every single calendar item and should be specific.
    - Vary the content titles and formats to keep the audience engaged.
    - Ensure the content ideas align with the target audience persona, goals, and provided trends.
    `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Error communicating with Google Gemini API:', error);
    throw new Error('Failed to generate AI content strategy.');
  }
};


const analyzeTrendSentiment = async (trends) => {
  if (!trends || trends.length === 0) return trends;
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  const keywords = trends.map((trend, index) => `${index}: "${trend.keyword}"`);
  const prompt = `You are a sentiment analysis expert. For the following list of keywords and topics, classify each one as 'Positive', 'Negative', or 'Neutral'.\nYour response MUST be a valid JSON object where keys are the numeric indices from the input list and values are the sentiment strings.\n\nKeywords to analyze:\n${keywords.join('\n')}\n\nExample Response:\n{\n  "0": "Neutral",\n  "1": "Positive",\n  "2": "Negative"\n}`;
  try {
    const result = await model.generateContent(prompt);
    const sentimentMap = JSON.parse(result.response.text());
    return trends.map((trend, index) => ({ ...trend, sentiment: sentimentMap[index] || 'Neutral' }));
  } catch (error) {
    console.error('Error analyzing trend sentiment with Gemini:', error);
    return trends.map(trend => ({ ...trend, sentiment: 'Neutral' }));
  }
};



/**
 * --- NEW: Generates a list of content ideas for a specific type (e.g., titles, hooks) ---
 * @param {string} topic - The primary topic for the ideas.
 * @param {string} type - The type of content ideas to generate.
 * @returns {Promise<string[]>} - An array of generated ideas.
 */
const generateContentIdeas = async (topic, type) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });
  
  const promptMap = {
    'Blog Titles': `Generate 5 catchy, SEO-friendly blog post titles about "${topic}".`,
    'YouTube Ideas': `Generate 5 engaging YouTube video ideas for a channel focused on "${topic}". Include a mix of tutorial, listicle, and review-style videos.`,
    'Tweet Hooks': `Generate 5 compelling tweet hooks (the first sentence of a tweet) designed to capture attention about "${topic}".`,
    'Short Form Video Scripts': `Generate 3 short-form video scripts (for TikTok/Reels) about "${topic}". Each script should have three scenes: a strong hook, the core value, and a call-to-action.`
  };

  const selectedPrompt = promptMap[type];
  if (!selectedPrompt) {
    throw new Error('Invalid idea type specified.');
  }

  const prompt = `
    You are an expert content creator AI. Your task is to generate content ideas.

    Task: ${selectedPrompt}

    The output MUST be a valid JSON object with a single key "ideas", which is an array of strings.
    For "Short Form Video Scripts", each string in the array should be a complete script formatted with scenes.

    Example for "Blog Titles":
    {
      "ideas": [
        "Title 1...",
        "Title 2..."
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedJson = JSON.parse(response.text());
    return generatedJson.ideas || [];
  } catch (error) {
    console.error(`Error generating content ideas for type ${type}:`, error);
    throw new Error('Failed to generate AI content ideas.');
  }
};


module.exports = {
  generateContentIdeas,
  generateContentStrategy,
  analyzeCompetitorTopics,
  analyzeTrendSentiment,
  generateAudiencePersona, // <-- Export new function
};