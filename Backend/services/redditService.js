const axios = require('axios');
const { parseStringPromise } = require('xml2js');

/**
 * Searches Reddit for hot posts related to a topic using the RSS feed.
 * This is much more reliable for unauthenticated requests than the JSON API.
 * @param {string} topic - The topic to search for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const searchRedditByTopic = async (topic) => {
  if (!topic) return [];
  try {
    // 1. Change the endpoint to .rss instead of .json
    const response = await axios.get('https://www.reddit.com/search.rss', {
      params: {
        q: topic,
        sort: 'hot',
        t: 'week',
      },
      headers: {
        // We keep a standard User-Agent just to be safe
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    });

    // 2. Parse the XML response from the RSS feed
    const parsedData = await parseStringPromise(response.data);
    
    // 3. Extract the relevant data from the parsed object structure
    const entries = parsedData.feed.entry;
    if (!entries || entries.length === 0) {
      return [];
    }
    
    const trends = entries.slice(0, 10).map(entry => ({
      // The title is in an array, so we access the first element
      keyword: entry.title[0], 
      platform: 'Reddit',
      industry: topic,
    }));

    return trends;
  } catch (error) {
    const status = error.response ? error.response.status : error.message;
    console.error(`Error searching Reddit RSS for topic "${topic}":`, status);
    return [];
  }
};

module.exports = { searchRedditByTopic };