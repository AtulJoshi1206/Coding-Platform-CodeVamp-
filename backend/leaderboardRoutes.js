const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/', leaderboardController.getLeaderboard);
router.post('/', leaderboardController.updateLeaderboard);

module.exports = router;
