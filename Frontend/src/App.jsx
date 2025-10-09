import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import StrategyPage from './pages/StrategyPage';
import CompetitorPage from './pages/CompetitorPage';

const Header = () => (
  <header className="bg-white shadow-sm sticky top-0 z-10">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold text-blue-800">
          AI Content Strategy
        </Link>
        <div className="flex space-x-4 sm:space-x-8">
          <NavLink to="/" className={({ isActive }) => `px-2 py-1 transition-colors duration-200 ${isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
            Dashboard
          </NavLink>
          <NavLink to="/strategy" className={({ isActive }) => `px-2 py-1 transition-colors duration-200 ${isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
            Strategy
          </NavLink>
          <NavLink to="/competitors" className={({ isActive }) => `px-2 py-1 transition-colors duration-200 ${isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}>
            Competitors
          </NavLink>
        </div>
      </div>
    </nav>
  </header>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/strategy" element={<StrategyPage />} />
            <Route path="/competitors" element={<CompetitorPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;