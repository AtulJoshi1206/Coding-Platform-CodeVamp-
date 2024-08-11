const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./config/db');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const compileRoutes = require('./routes/compileRoutes');

app.use(bodyParser.json());

// Connect to database
db.connect();

// API Routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/compile', compileRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
