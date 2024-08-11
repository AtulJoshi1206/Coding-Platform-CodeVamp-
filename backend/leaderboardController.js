const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Leaderboard.find().populate('user').sort({ score: -1 });
        res.json(leaderboard);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateLeaderboard = async (req, res) => {
    try {
        const { user, score } = req.body;
        let leaderboardEntry = await Leaderboard.findOne({ user });

        if (leaderboardEntry) {
            leaderboardEntry.score += score;
        } else {
            leaderboardEntry = new Leaderboard({ user, score });
        }

        await leaderboardEntry.save();
        res.json(leaderboardEntry);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
