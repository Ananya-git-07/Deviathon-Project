import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';

const ContentGapModal = ({ isOpen, onClose, gaps, competitorName, loading }) => {
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
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Content Gap Analysis</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <p className="text-gray-400 mb-6">Strategic opportunities based on <span className="font-semibold text-white">{competitorName}</span>'s content themes.</p>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-gray-300">AI is analyzing gaps...</p>
              </div>
            )}
            
            {!loading && gaps.length > 0 && (
              <div className="space-y-4">
                {gaps.map((gap, index) => (
                  <div key={index} className="bg-gray-700/50 p-4 rounded-lg flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-200">{gap}</p>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && gaps.length === 0 && (
                 <p className="text-center text-gray-400 py-8">No specific gaps were identified.</p>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContentGapModal;