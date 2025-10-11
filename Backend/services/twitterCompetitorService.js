const { TwitterApi } = require('twitter-api-v2');
const cache = require('./cacheService');

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const roClient = twitterClient.readOnly;

/**
 * Fetches the latest tweets from a specific Twitter user.
 * @param {string} username - The Twitter username (without @).
 * @returns {Promise<object>} - An object containing user details and recent posts.
 */
const getTweetsByUsername = async (username) => {
  const cacheKey = `twitter_competitor_${username.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving competitor tweets for "${username}" from cache.`);
    return cachedData;
  }
  
  try {
    // Step 1: Get the user's ID from their username
    const user = await roClient.v2.userByUsername(username);
    if (!user.data) {
      throw new Error(`Twitter user not found: ${username}`);
    }
    const userId = user.data.id;
    const name = user.data.name;

    // Step 2: Fetch the user's recent tweets using their ID
    const tweets = await roClient.v2.userTimeline(userId, {
      'max_results': 10,
      'exclude': ['replies', 'retweets'],
      'tweet.fields': ['created_at'],
    });

    if (!tweets.data.data) {
      return { twitterHandle: username, name, recentPosts: [] };
    }

    const recentPosts = tweets.data.data.map(tweet => ({
      postId: tweet.id,
      title: tweet.text,
      link: `https://twitter.com/${username}/status/${tweet.id}`,
      publishedAt: new Date(tweet.created_at),
      format: 'Tweet',
    }));
    
    const result = { twitterHandle: username, name, recentPosts };
    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    const errorMessage = error.data ? `${error.data.title}: ${error.data.detail}` : error.message;
    console.error(`Error fetching tweets for user "${username}":`, errorMessage);
    throw new Error('Could not fetch Twitter user data.');
  }
};

module.exports = { getTweetsByUsername };