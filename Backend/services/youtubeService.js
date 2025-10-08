const axios = require('axios');

const searchYouTubeByTopic = async (topic) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: topic, // Use the provided topic as the search query
        type: 'video',
        order: 'relevance', // Order by relevance to the topic
        relevanceLanguage: 'en',
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const trends = response.data.items.map(item => ({
      keyword: item.snippet.title,
      platform: 'YouTube',
      industry: topic,
    }));

    return trends;
  } catch (error) {
    console.error('Error fetching YouTube search results:', error.response ? error.response.data : error.message);
    return [];
  }
};

module.exports = { searchYouTubeByTopic };