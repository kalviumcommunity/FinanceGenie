const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Zero-shot
router.post('/zero-shot', geminiController.zeroShotCategorize);

// One-shot
router.post('/one-shot', geminiController.oneShotCategorize);

// Multi-shot
router.post('/multi-shot', geminiController.multiShotCategorize);


module.exports = router;