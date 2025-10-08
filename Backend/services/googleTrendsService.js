const googleTrends = require('google-trends-api');

/**
 * Finds rising or top related topics from Google Trends for a specific keyword.
 * @param {string} keyword - The keyword to find related trends for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const getGoogleRelatedTopics = async (keyword) => {
  if (!keyword) return [];
  try {
    const results = await googleTrends.relatedTopics({
      keyword,
      startTime: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // Last 30 days
      geo: 'US',
    });
    
    const parsedResults = JSON.parse(results).default.rankedList;
    
    // Prioritize "rising" topics, but fall back to "top" topics if rising is empty
    let trendsData = parsedResults[1]?.rankedKeyword; // [1] is for "rising"
    if (!trendsData || trendsData.length === 0) {
      console.log(`No 'rising' Google Trends for "${keyword}". Falling back to 'top'.`);
      trendsData = parsedResults[0]?.rankedKeyword; // [0] is for "top"
    }

    if (!trendsData) return [];

    const trends = trendsData.map(trend => ({
      keyword: trend.topic.title, // Use the correct field from the new response structure
      platform: 'Google Trends',
      industry: keyword,
    }));

    return trends;
  } catch (error) {
    console.error('Error fetching Google related topics:', error);
    return [];
  }
};

module.exports = { getGoogleRelatedTopics };