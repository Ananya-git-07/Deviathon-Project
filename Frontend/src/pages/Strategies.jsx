import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BrainCircuit, Calendar, Target, Clock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast'; // <-- Import toast
import StrategiesSkeleton from '../components/StrategiesSkeleton'; // <-- Import skeleton

const Strategies = () => {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/strategy');
        setStrategies(res.data.data || []);
      } catch (err) {
        setError(err?.normalizedMessage || 'Failed to load strategies');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategies();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/calendar/${id}`);
  };

  const handleDeleteStrategy = async (strategyIdToDelete) => {
    if (!window.confirm('Are you sure you want to permanently delete this strategy?')) return;

    // Keep a copy of the old state to revert on failure
    const originalStrategies = [...strategies];
    
    // Optimistically update the UI
    setStrategies(currentStrategies =>
      currentStrategies.filter(strategy => strategy._id !== strategyIdToDelete)
    );

    try {
      await api.delete(`/api/strategy/${strategyIdToDelete}`);
      toast.success('Strategy deleted successfully!');
    } catch (err) {
      toast.error(err?.normalizedMessage || 'Failed to delete strategy.');
      // Revert the UI on failure
      setStrategies(originalStrategies);
    }
  };

  if (loading) {
    return <StrategiesSkeleton />;
  }


return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            My Saved Strategies
          </h1>
          <p className="text-gray-400 mt-2">Review and access your previously generated content plans.</p>
        </motion.div>

        {loading && <div className="text-center text-gray-400">Loading your strategies...</div>}
        
        {/* Display a single, prominent error message at the top */}
        {error && <div className="text-center text-red-400 p-4 mb-4 bg-red-900/50 rounded-lg">{error}</div>}
        
        {!loading && strategies.length === 0 && (
          <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-2">No Strategies Found</h2>
            <p>Go to the Dashboard to generate your first AI content strategy!</p>
          </div>
        )}

        {!loading && strategies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <motion.div
                key={strategy._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.03, borderColor: '#a855f7' }}
                // --- Add 'relative' positioning to the card to contain the delete button ---
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 cursor-pointer"
              >
                {/* --- NEW: Delete Button --- */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the card's click handler from firing
                    handleDeleteStrategy(strategy._id);
                  }}
                  className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Delete strategy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* Main card content is now wrapped in a div to allow clicking */}
                <div onClick={() => handleCardClick(strategy._id)}>
                  <div className="flex items-center mb-4 pr-8"> {/* Add padding-right to avoid overlap with delete button */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 mr-4">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-white capitalize">{strategy.topic}</h2>
                      <p className="text-xs text-gray-400">Strategy</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Target className="w-4 h-4 mr-2 text-purple-400" />
                      <span><strong>Goal:</strong> {strategy.goals}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-purple-400" />
                       <span><strong>Created:</strong> {new Date(strategy.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                      <span className="flex items-center justify-center w-full px-4 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
                          <Calendar className="w-4 h-4 mr-2"/>
                          View Content Plan
                      </span>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};


export default Strategies;