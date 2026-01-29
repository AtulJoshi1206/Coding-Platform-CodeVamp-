# CodeVamp PRO - Advanced Competitive Coding Platform

**CodeVamp PRO** is a modernized, production-ready competitive programming platform designed to help developers sharpen their coding skills. It offers a seamless experience with features like real-time code execution, contest management, daily challenges, and a global leaderboard.

Built with a robust **Microservices-ready** architecture using the **MERN Stack** (with NestJS) and **Dockerized** code execution environments.

---

## 🚀 Key Features

### 💻 **Advanced Code IDE**
- **Multi-Language Support**: Run Python, C++, Java, JavaScript, and Go.
- **Real-Time Execution**: Sandbox execution environment for safe and fast code runs.
- **Custom Test Cases**: Ability to add custom input/output for testing.
- **Rich Editor**: IntelliSense, syntax highlighting, and dark mode.

### 🏆 **Contest System**
- **Live Contests**: Participate in scheduled coding contests.
- **Leaderboards**: Real-time ranking updates during contests.
- **Problem Sets**: Curated algorithmic problems from Easy to Hard. (15+ seeded problems).

### 🔥 **Daily Challenges (POTD)**
- **Streak System**: Maintain your daily solving streak.
- **Algorithm of the Day**: A new problem every 24 hours to keep you consistent.
- **Rewards**: Earn unique badges for hitting streak milestones (3-day, 7-day, 30-day).

### 📊 **User Analytics & Profile**
- **Detailed Stats**: Track total solved, accuracy, and points.
- **Badges & Achievements**: Visual rewards for accomplishments.
- **Submission History**: Review past attempts and improve.
- **Heatmap**: GitHub-style activity graph.

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **State Management**: React Hooks & Context
- **Real-Time**: Socket.io Client

### **Backend**
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB (Mongoose)
- **Queue System**: BullMQ (Redis)
- **Real-Time**: Socket.io Gateway
- **Authentication**: JWT & Passport Strategy

### **Infrastructure**
- **Docker**: Containerized execution for code safety.
- **Nx/Turbo**: Monorepo management (conceptual).

---

## 🏗 Project Structure

The project follows a monorepo-style structure:

```
├── apps
│   ├── api          # NestJS Backend Application
│   │   ├── src
│   │   │   ├── problems      # Problem Management
│   │   │   ├── submissions   # Code Execution & Scoring
│   │   │   ├── contests      # Contest Logic
│   │   │   ├── potd          # Problem of the Day
│   │   │   ├── users         # User Profile & Auth
│   │   │   └── leaderboard   # Real-time Ranking
│   │   └── test
│   │
│   └── web          # React Frontend Application
│       ├── src
│       │   ├── components    # Reusable UI Components
│       │   ├── pages         # Core Pages (Dashboard, IDE, Profile)
│       │   └── styles        # Global Styles
│
└── package.json     # Root Dependencies
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18+
- **MongoDB**: Local or Atlas URI
- **Redis**: Required for the job queue

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AtulJoshi1206/Coding-Platform-CodeVamp-.git
   cd Coding-Platform-CodeVamp-
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install API dependencies
   cd apps/api && npm install

   # Install Web dependencies
   cd ../../apps/web && npm install
   ```

3. **Environment Setup**
   Create a `.env` file in `apps/api/`:
   ```env
   MONGO_URI=mongodb://localhost:27017/codevamp
   JWT_SECRET=supersecretkey
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Running the App

1. **Start the Backend (API)**
   ```bash
   # In apps/api
   npm run start:dev
   ```
   *The server will start on `http://localhost:3000` and seed initial problems automatically.*

2. **Start the Code Execution Worker**
   ```bash
   # In apps/api (or separate terminal)
   npm run dev:worker
   ```

3. **Start the Frontend**
   ```bash
   # In apps/web
   npm run dev
   ```
   *The web app will run on `http://localhost:5173`.*

---

## 📡 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/problems` | Fetch all available problems |
| **GET** | `/problems/:id` | Get problem details |
| **POST** | `/submissions/execute` | Run code against test cases |
| **POST** | `/auth/login` | User login |
| **POST** | `/auth/register` | Create new account |
| **GET** | `/users/me` | Get current user profile |
| **GET** | `/leaderboard` | Get global rankings |
| **GET** | `/potd` | Get Problem of the Day |
| **GET** | `/contests` | List active/upcoming contests |
| **POST** | `/contests/:id/join` | Join a contest |

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Made with ❤️ by Atul Joshi**
