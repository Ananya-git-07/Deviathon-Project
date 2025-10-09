const { TwitterApi } = require('twitter-api-v2');
const NodeCache = require('node-cache');

// Initialize a new cache. The stdTTL (standard time to live) is the cache duration in seconds.
// 900 seconds = 15 minutes.
const twitterCache = new NodeCache({ stdTTL: 900 });

// Initialize the Twitter client
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const roClient = twitterClient.readOnly;

/**
 * Searches for recent, popular tweets by topic, with caching.
 * @param {string} topic - The topic to search for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const searchTwitterByTopic = async (topic) => {
  if (!topic) return [];

  // 1. Define a unique key for this topic in our cache
  const cacheKey = `twitter_trends_${topic.toLowerCase()}`;

  // 2. Check if we have valid, non-expired data in the cache
  const cachedData = twitterCache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving Twitter trends for "${topic}" from cache.`);
    return cachedData; // Return the cached data immediately
  }

  // 3. If no data is in the cache, proceed to call the API
  console.log(`Fetching new Twitter trends for "${topic}" from API.`);
  try {
    const response = await roClient.v2.search(`${topic} -is:retweet lang:en`, {
      'max_results': 10,
      'sort_order': 'relevancy',
    });

    if (!response.data.data) return [];

    const trends = response.data.data.map(tweet => ({
      keyword: tweet.text,
      platform: 'Twitter',
      industry: topic,
    }));
    
    // 4. Save the new data into the cache for next time
    twitterCache.set(cacheKey, trends);
    
    return trends;

  } catch (error) {
    console.error(`Error searching Twitter for topic "${topic}":`, error);
    return []; // Return an empty array on error so the app doesn't crash
  }
};

module.exports = { searchTwitterByTopic };