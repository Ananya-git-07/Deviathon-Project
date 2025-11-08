import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';

const ExpandIdeaModal = ({ isOpen, onClose, idea }) => {
  const [expandedContent, setExpandedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && idea) {
      const fetchExpandedContent = async () => {
        setLoading(true);
        setError('');
        setExpandedContent('');
        try {
          const res = await api.post('/api/strategy/expand-idea', {
            title: idea.title,
            format: idea.format,
          });
          setExpandedContent(res.data.data);
        } catch (err) {
          setError(err.normalizedMessage || 'Failed to expand idea.');
        } finally {
          setLoading(false);
        }
      };
      fetchExpandedContent();
    }
  }, [isOpen, idea]);

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
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Wand2 className="w-6 h-6 text-purple-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Expanded Idea</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <p className="text-gray-400 mb-6 text-sm">AI-generated content for: "<span className="font-semibold text-gray-200">{idea?.title}</span>"</p>

            <div className="bg-gray-900/50 p-4 rounded-lg min-h-[200px] max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-gray-300">AI is creating content...</p>
                </div>
              )}
              {error && <p className="text-red-400">{error}</p>}
              {!loading && expandedContent && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{expandedContent}</ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandIdeaModal;