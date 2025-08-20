const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Zero-shot
router.post('/zero-shot', geminiController.zeroShotCategorize);

module.exports = router;