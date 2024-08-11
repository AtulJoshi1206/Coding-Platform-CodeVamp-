const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
