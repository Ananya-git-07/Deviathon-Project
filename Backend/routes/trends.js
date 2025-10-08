const express = require('express');
const router = express.Router();

// We will create the controller logic in the next file
const { getTrends } = require('../controllers/trendsController');

// Route to get trends
router.route('/').get(getTrends);

module.exports = router;