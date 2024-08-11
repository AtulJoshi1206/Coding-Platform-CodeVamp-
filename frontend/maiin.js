const questions = {
    hello_world: {
        title: "Hello World",
        text: "Write a Python program that prints 'Hello, World!'",
        solution: "print('Hello, World!')"
    },
    palindrome: {
        title: "Palindrome Checker",
        text: "Write a Python program to check if a given string is a palindrome.",
        solution: "def is_palindrome(s): return s == s[::-1]"
    },
    fibonacci: {
        title: "Fibonacci Series",
        text: "Write a Python program to generate the Fibonacci series up to a given number.",
        solution: "def fibonacci(n): a, b = 0, 1; for i in range(n): print(a); a, b = b, a + b"
    },
    reverse: {
        title: "Reverse String",
        text: "Write a Python program to reverse a string.",
        solution: "def reverse_string(s): return s[::-1]"
    },
    sum_of_digits: {
        title: "Sum of Digits",
        text: "Write a Python program to find the sum of the digits of a given number.",
        solution: "def sum_of_digits(n): return sum(int(digit) for digit in str(n))"
    },
    factorial: {
        title: "Factorial",
        text: "Write a Python program to calculate the factorial of a number.",
        solution: "def factorial(n): return 1 if n == 0 else n * factorial(n-1)"
    },
    prime_number: {
        title: "Prime Number",
        text: "Write a Python program to check if a number is prime.",
        solution: "def is_prime(n): return all(n % i != 0 for i in range(2, int(n**0.5)+1)) and n > 1"
    },
    gcd: {
        title: "GCD of Two Numbers",
        text: "Write a Python program to find the GCD of two numbers.",
        solution: "def gcd(a, b): while b: a, b = b, a % b; return a"
    },
    leap_year: {
        title: "Leap Year Checker",
        text: "Write a Python program to check if a given year is a leap year.",
        solution: "def is_leap_year(year): return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)"
    },
    armstrong: {
        title: "Armstrong Number",
        text: "Write a Python program to check if a number is an Armstrong number.",
        solution: "def is_armstrong(n): return n == sum(int(digit)**len(str(n)) for digit in str(n))"
    }
};

function selectQuestion(questionId) {
    const question = questions[questionId];
    document.getElementById("questionTitle").innerText = question.title;
    document.getElementById("questionText").innerText = question.text;
    document.getElementById("codeSource").value = "";  // Clear the code editor
}

function runCode() {
    const questionId = document.getElementById("questionTitle").innerText.toLowerCase().replace(/ /g, '_');
    const code = document.getElementById("codeSource").value;

    // Temporary: Execute the code using eval (only for demonstration, not recommended for actual implementation)
    try {
        const output = eval(code);  // In reality, you'll use Pyodide to run Python code

        if (code.trim() === questions[questionId].solution.trim()) {
            alert("Congratulations! You've solved the problem.");
            let score = parseInt(document.getElementById("score").innerText);
            document.getElementById("score").innerText = score + 10;  // Increment score by 10
        } else {
            alert("Incorrect solution. Please try again.");
        }
    } catch (error) {
        alert("There was an error running your code: " + error.message);
    }
}
// Function to update user progress
function updateUserProgress(userId, score, questionsSolved) {
    fetch('/update-progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
            score: score,
            questionsSolved: questionsSolved
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Progress updated:', data);
        fetchLeaderboard(); // Refresh leaderboard after updating progress
    })
    .catch(error => {
        console.error('Error updating progress:', error);
    });
}

// Function to fetch leaderboard data
function fetchLeaderboard() {
    fetch('/get-leaderboard')
    .then(response => response.json())
    .then(data => {
        updateLeaderboardTable(data);
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
    });
}

// Function to update the leaderboard table
function updateLeaderboardTable(data) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.username}</td>
            <td>${entry.score}</td>
            <td>${entry.questionsSolved}</td>
        `;
        tbody.appendChild(row);
    });
}

// Example of calling updateUserProgress after a question is solved
document.getElementById('submitQuestion').addEventListener('click', () => {
    // Example values
    updateUserProgress('user123', 50, 5);
});
