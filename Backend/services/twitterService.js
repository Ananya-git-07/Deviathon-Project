const { TwitterApi } = require('twitter-api-v2');
const cache = require('./cacheService');

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const roClient = twitterClient.readOnly;

const searchTwitterByTopic = async (topic) => {
  if (!topic) return [];

  const cacheKey = `twitter_trends_${topic.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving Twitter trends for "${topic}" from cache.`);
    return cachedData;
  }

  console.log(`Fetching new Twitter trends for "${topic}" from API.`);
  try {
    const response = await roClient.v2.search(`${topic} -is:retweet lang:en`, {
      'max_results': 10,
      'sort_order': 'relevancy',
      // We need the author's username to build the link
      'expansions': 'author_id',
      'user.fields': 'username',
    });

    if (!response.data || !response.data.data) return [];
    
    const users = response.data.includes?.users || [];
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user.username;
      return acc;
    }, {});

    // --- UPDATED: Capture the link ---
    const trends = response.data.data.map(tweet => ({
      keyword: tweet.text,
      // Construct the tweet URL
      link: `https://twitter.com/${userMap[tweet.author_id]}/status/${tweet.id}`,
      platform: 'Twitter',
      industry: topic,
    }));
    
    cache.set(cacheKey, trends);
    return trends;

  } catch (error) {
    console.error(`Error searching Twitter for topic "${topic}":`, error);
    return [];
  }
};

module.exports = { searchTwitterByTopic };