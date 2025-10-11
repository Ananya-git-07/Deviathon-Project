import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// --- 1. REMOVED the logo import ---
// import logo from '../assets/logo.png'; 

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  const navLinkClasses = ({ isActive }) => isActive ? 'text-green-400 font-semibold' : 'text-gray-300 hover:text-green-400';
  const toggleMenu = () => setOpen(prev => !prev);
  const closeMenu = () => setOpen(false);

  return (
    <header className="bg-[#1f2937] text-white shadow-lg font-roboto">
      <div className="container mx-auto flex items-center justify-between p-4">
        
        {/* --- 2. Replaced the <img> tag with a styled <div> for the text logo --- */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold text-white tracking-wider">Planova AI</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          {user && (
            <>
              <NavLink to="/" className={navLinkClasses}>Dashboard</NavLink>
              <NavLink to="/strategies" className={navLinkClasses}>My Strategies</NavLink>
              <NavLink to="/idea-bank" className={navLinkClasses}>Idea Bank</NavLink>
              <NavLink to="/competitors" className={navLinkClasses}>Competitors</NavLink>
              <NavLink to="/analytics" className={navLinkClasses}>Analytics</NavLink>
              <button onClick={handleLogout} className="text-gray-300 hover:text-red-400">Logout</button>
            </>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={navLinkClasses}>Login</NavLink>
              <NavLink to="/signup" className="px-4 py-2 bg-green-500 rounded text-white font-semibold hover:bg-green-600">Sign Up</NavLink>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} aria-label="Toggle menu"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg></button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {open && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="flex flex-col p-4 space-y-2">
            {user ? (
              <>
                <Link to="/" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Dashboard</Link>
                <Link to="/strategies" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">My Strategies</Link>
                <Link to="/idea-bank" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Idea Bank</Link>
                <Link to="/competitors" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Competitors</Link>
                <Link to="/analytics" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Analytics</Link>
                <button onClick={handleLogout} className="py-2 px-3 text-left text-red-400 hover:bg-gray-700 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Login</Link>
                <Link to="/signup" onClick={closeMenu} className="py-2 px-3 text-gray-300 hover:bg-gray-700 rounded">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;