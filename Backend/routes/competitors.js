const express = require('express');
const router = express.Router();
const { addCompetitor, getCompetitors, analyzeGaps } = require('../controllers/competitorController'); // <-- Import analyzeGaps
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addCompetitor)
  .get(protect, getCompetitors);
  
// --- NEW: Route for content gap analysis ---
router.route('/:id/analyze-gaps').get(protect, analyzeGaps);

module.exports = router;