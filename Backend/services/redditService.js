const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const cache = require('./cacheService');

/**
 * Searches Reddit for hot posts related to a topic using the RSS feed.
 * @param {string} topic - The topic to search for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const searchRedditByTopic = async (topic) => {
  if (!topic) return [];
  
  const cacheKey = `reddit_trends_${topic.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving Reddit trends for "${topic}" from cache.`);
    return cachedData;
  }

  try {
    console.log(`Fetching new Reddit trends for "${topic}" from API.`);
    const response = await axios.get('https://www.reddit.com/search.rss', {
      params: {
        q: topic,
        sort: 'hot',
        t: 'week',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    const parsedData = await parseStringPromise(response.data);
    
    const entries = parsedData.feed.entry;
    if (!entries || entries.length === 0) {
      return [];
    }
    
    const trends = entries.slice(0, 10).map(entry => ({
      keyword: entry.title[0], 
      link: entry.link[0].$.href, // Correctly extracts the direct post link
      platform: 'Reddit',
      industry: topic,
    }));

    cache.set(cacheKey, trends);
    return trends;
  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.error(`Error searching Reddit RSS for topic "${topic}":`, status);
    return [];
  }
};

module.exports = { searchRedditByTopic };