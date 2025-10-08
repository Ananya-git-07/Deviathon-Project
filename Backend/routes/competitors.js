const express = require('express');
const router = express.Router();

const { addCompetitor, getCompetitors } = require('../controllers/competitorController');

router.route('/')
  .post(addCompetitor)
  .get(getCompetitors);

module.exports = router;