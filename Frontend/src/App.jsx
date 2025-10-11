import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import Competitors from './pages/Competitors';
import Strategies from './pages/Strategies';
import IdeaBank from './pages/IdeaBank'; // <-- Import new page
import Login from './pages/Login';       // <-- Import new page
import Signup from './pages/Signup';     // <-- Import new page
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // <-- Import Auth
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import ProtectedRoute

const App = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStrategyGenerated = (strategy) => {
    navigate(`/calendar/${strategy._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-roboto bg-gray-900">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard onStrategyGenerated={handleStrategyGenerated} /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/strategies" element={<ProtectedRoute><Strategies /></ProtectedRoute>} />
          <Route path="/calendar/:strategyId" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/competitors" element={<ProtectedRoute><Competitors /></ProtectedRoute>} />
          <Route path="/idea-bank" element={<ProtectedRoute><IdeaBank /></ProtectedRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

function RootApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default RootApp;