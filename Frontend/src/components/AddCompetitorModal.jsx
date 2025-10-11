import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Twitter } from 'lucide-react';
import { FaRss } from 'react-icons/fa';

const platformOptions = [
  { value: 'YouTube', label: 'YouTube', icon: <Youtube className="w-5 h-5 text-red-500" />, placeholder: '@handle or Channel Name' },
  { value: 'Twitter', label: 'Twitter', icon: <Twitter className="w-5 h-5 text-blue-400" />, placeholder: '@username (without @)' },
  { value: 'Blog', label: 'Blog (RSS)', icon: <FaRss className="w-5 h-5 text-orange-500" />, placeholder: 'https://example.com/feed' },
];

const AddCompetitorModal = ({ isOpen, onClose, onAdd }) => {
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedPlatform = platformOptions.find(p => p.value === platform);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle) {
      setError('Please enter a value.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onAdd({ platform, handle });
      onClose();
      setHandle('');
      setPlatform('YouTube');
    } catch (err) {
      setError(err.message || 'Failed to add competitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Competitor</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Select a platform and provide the requested information to start tracking.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="platform">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {platformOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPlatform(opt.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${platform === opt.value ? 'bg-blue-600/30 border-blue-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}
                    >
                      {opt.icon}
                      <span className="text-xs mt-1 font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2 capitalize" htmlFor="handle">
                  {platform} {platform === 'Blog (RSS)' ? 'URL' : 'Handle'}
                </label>
                <input
                  id="handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder={selectedPlatform.placeholder}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-500"
                >
                  {loading ? 'Adding...' : 'Add Competitor'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCompetitorModal;