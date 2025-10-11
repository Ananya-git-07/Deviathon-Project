const express = require('express');
const router = express.Router();

const { addCompetitor, getCompetitors } = require('../controllers/competitorController');

const { protect } = require('../middleware/authMiddleware'); 

router.route('/')
  .post(protect, addCompetitor)
  .get(protect, getCompetitors);

module.exports = router;