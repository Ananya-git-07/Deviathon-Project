const axios = require('axios');

/**
 * Searches for recent and relevant trending videos on YouTube by topic.
 * @param {string} topic - The topic to search for.
 * @returns {Promise<Array>} - A list of trend objects.
 */
const searchYouTubeByTopic = async (topic) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: topic,
        type: 'video',
        order: 'relevance',
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

/**
 * Fetches the latest videos from a specific YouTube channel by username.
 * @param {string} username - The YouTube channel username (e.g., the part after @).
 * @returns {Promise<object>} - An object containing channel details and recent videos.
 */
const getChannelVideos = async (username) => {
  try {
    // Step 1: Find the channel ID from the username
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: username,
        type: 'channel',
        maxResults: 1,
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    if (searchResponse.data.items.length === 0) {
      throw new Error(`YouTube channel not found for username: ${username}`);
    }
    const channelId = searchResponse.data.items[0].snippet.channelId;
    const channelTitle = searchResponse.data.items[0].snippet.channelTitle;

    // Step 2: Fetch the latest 10 videos using the channel ID
    const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: channelId,
        order: 'date',
        maxResults: 10,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    const recentPosts = videoResponse.data.items.map(item => ({
      postId: item.id.videoId,
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: new Date(item.snippet.publishedAt),
      format: 'Video',
    }));

    return { channelId, channelTitle, recentPosts };
  } catch (error) {
    const errorMessage = error.response ? error.response.data.error.message : error.message;
    console.error('Error fetching channel videos:', errorMessage);
    throw new Error('Could not fetch YouTube channel data.');
  }
};

// THIS IS THE FIX: We are now exporting BOTH functions correctly.
module.exports = { searchYouTubeByTopic, getChannelVideos };