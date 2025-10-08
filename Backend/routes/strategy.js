const express = require('express');
const router = express.Router();

const { generateStrategy } = require('../controllers/strategyController');

// Route to generate a content strategy
router.route('/generate').post(generateStrategy);

module.exports = router;