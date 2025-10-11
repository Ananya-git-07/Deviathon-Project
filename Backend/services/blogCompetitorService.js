const Parser = require('rss-parser');
const cache = require('./cacheService');

const parser = new Parser();

/**
 * Fetches the latest posts from a blog's RSS feed.
 * @param {string} rssUrl - The URL of the RSS feed.
 * @returns {Promise<object>} - An object containing blog details and recent posts.
 */
const getPostsFromRss = async (rssUrl) => {
  const cacheKey = `blog_competitor_${rssUrl}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Serving competitor blog posts for "${rssUrl}" from cache.`);
    return cachedData;
  }

  try {
    const feed = await parser.parseURL(rssUrl);
    
    const name = feed.title || 'Blog';
    
    if (!feed.items || feed.items.length === 0) {
      return { blogRssUrl: rssUrl, name, recentPosts: [] };
    }

    const recentPosts = feed.items.slice(0, 10).map(item => ({
      postId: item.guid || item.link,
      title: item.title,
      link: item.link,
      publishedAt: new Date(item.pubDate || item.isoDate),
      format: 'Blog Post',
    }));

    const result = { blogRssUrl: rssUrl, name, recentPosts };
    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`Error fetching RSS feed for "${rssUrl}":`, error.message);
    throw new Error('Could not fetch or parse the RSS feed.');
  }
};

module.exports = { getPostsFromRss };