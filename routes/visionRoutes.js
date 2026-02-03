const express = require('express');
const visionController = require('../controllers/visionController');

const router = express.Router();

// POST /api/vision/analyze
router.post('/analyze', visionController.analyze);

module.exports = router;
