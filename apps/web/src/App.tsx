import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import IDE from './pages/IDE';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Contests from './pages/Contests';
import CreateContest from './pages/CreateContest';
import ContestDetail from './pages/ContestDetail';
import ContestIDE from './pages/ContestIDE';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-white font-sans selection:bg-primary/30 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/ide/:problemId" element={<IDE />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/contests/create" element={<CreateContest />} />
            <Route path="/contests/:contestId" element={<ContestDetail />} />
            <Route path="/contests/:contestId/problem/:problemIndex" element={<ContestIDE />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
