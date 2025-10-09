const googleTrends = require('google-trends-api');

const getGoogleRelatedTopics = async (keyword) => {
  if (!keyword) return [];
  try {
    const results = await googleTrends.relatedTopics({
      keyword,
      startTime: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // Last 30 days
      geo: 'US',
    });
    
    const parsedResults = JSON.parse(results).default.rankedList;
    
    // Safely get the arrays for "top" and "rising" topics.
    // Use the nullish coalescing operator (??) to default to an empty array if one is missing.
    const topTopics = parsedResults[0]?.rankedKeyword ?? [];
    const risingTopics = parsedResults[1]?.rankedKeyword ?? [];

    // Combine both lists into one.
    const combinedTopics = [...topTopics, ...risingTopics];

    if (combinedTopics.length === 0) return [];

    // Map the combined list into our desired format.
    const trends = combinedTopics.map(trend => ({
      keyword: trend.topic.title,
      platform: 'Google Trends',
      industry: keyword,
    }));

    // To avoid duplicates, we can create a Set of keywords and then map back to an array.
    const uniqueTrends = Array.from(new Set(trends.map(t => t.keyword)))
      .map(keyword => {
        return trends.find(t => t.keyword === keyword);
      });

    return uniqueTrends;

  } catch (error) {
    console.error('Error fetching Google related topics:', error);
    return [];
  }
};

module.exports = { getGoogleRelatedTopics };