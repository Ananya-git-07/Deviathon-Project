const express = require('express');
const router = express.Router();

const { 
  generateStrategy, 
  getStrategies, 
  getStrategyById,
  updateCalendarItem,
  generatePersona, // <-- IMPORT new controller
  generateIdeas, // <-- Import
  deleteStrategy
} = require('../controllers/strategyController');

const { protect } = require('../middleware/authMiddleware'); // <-- Import protect

router.route('/generate').post(protect, generateStrategy);
router.route('/generate-persona').post(generatePersona); // <-- NEW ROUTE

router.route('/').get(protect, getStrategies);
router.route('/:id')
  .get(protect, getStrategyById)
  .delete(protect, deleteStrategy);
router.route('/:strategyId/calendar/:day').put(protect, updateCalendarItem);
router.route('/generate-ideas').post(protect, generateIdeas); // <-- Apply protect

module.exports = router;