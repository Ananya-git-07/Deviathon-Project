const { TwitterApi } = require('twitter-api-v2');

// Initialize the client with your Bearer Token
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

// Use the read-only client
const roClient = twitterClient.readOnly;

const searchTwitterByTopic = async (topic) => {
  if (!topic) return [];
  try {
    // Search for recent tweets matching the topic
    // -is:retweet excludes retweets to get original content
    // lang:en ensures we get English tweets
    const response = await roClient.v2.search(`${topic} -is:retweet lang:en`, {
      'max_results': 10,
      'sort_order': 'relevancy', // Find the most relevant tweets
    });

    if (!response.data.data) return [];

    const trends = response.data.data.map(tweet => ({
      keyword: tweet.text,
      platform: 'Twitter',
      industry: topic,
    }));
    
    return trends;

  } catch (error) {
    console.error(`Error searching Twitter for topic "${topic}":`, error);
    return [];
  }
};

module.exports = { searchTwitterByTopic };