const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Route to update user progress
app.post('/update-progress', (req, res) => {
    const { userId, score, questionsSolved } = req.body;
    // Update the user's progress in the database
    // Example:
    // db.updateUserProgress(userId, score, questionsSolved);

    res.json({ success: true });
});

// Route to get leaderboard data
app.get('/get-leaderboard', (req, res) => {
    // Fetch leaderboard data from the database
    // Example:
    // const leaderboardData = db.getLeaderboard();

    // Example static data
    const leaderboardData = [
        { username: 'Alice', score: 100, questionsSolved: 10 },
        { username: 'Bob', score: 90, questionsSolved: 9 },
        // Add more entries as needed
    ];

    res.json(leaderboardData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
