const mongoose = require('mongoose');
const PlaygroundQuestion = require('./models/playgroundQuestion');

mongoose.connect('mongodb://localhost:27017/online-coding-platform', { useNewUrlParser: true, useUnifiedTopology: true });

const questions = [
    {
        title: 'Add Two Numbers',
        description: 'Write a program to add two numbers.',
        difficulty: 'Easy',
        testCases: [
            { input: '2\n3', expectedOutput: '5\n' },
            { input: '10\n20', expectedOutput: '30\n' }
        ]
    },
    {
        title: 'Check Palindrome',
        description: 'Write a program to check if a string is a palindrome.',
        difficulty: 'Medium',
        testCases: [
            { input: 'racecar', expectedOutput: 'True\n' },
            { input: 'hello', expectedOutput: 'False\n' }
        ]
    },
    {
        title: 'Find the Maximum Subarray',
        description: 'Given an array, find the maximum sum subarray.',
        difficulty: 'Hard',
        testCases: [
            { input: '-2\n1\n-3\n4\n-1\n2\n1\n-5\n4', expectedOutput: '6\n' },
            { input: '1\n2\n3\n4\n-10', expectedOutput: '10\n' }
        ]
    }
];

PlaygroundQuestion.insertMany(questions)
    .then(() => console.log('Sample questions added!'))
    .catch(error => console.error('Failed to add sample questions:', error))
    .finally(() => mongoose.connection.close());
