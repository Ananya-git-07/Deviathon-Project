const NodeCache = require('node-cache');

// --- UPDATE: Increased the standard TTL from 3600 (1 hour) to 21600 (6 hours) ---
const cache = new NodeCache({ stdTTL: 21600 });

console.log('Cache service initialized with a 6-hour default TTL.');

module.exports = cache;