import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, FileText, Youtube, Twitter, Video } from 'lucide-react';
import api from '../api/axios';

const ideaTypes = [
  { name: 'Blog Titles', icon: <FileText className="w-6 h-6" /> },
  { name: 'YouTube Ideas', icon: <Youtube className="w-6 h-6" /> },
  { name: 'Tweet Hooks', icon: <Twitter className="w-6 h-6" /> },
  { name: 'Short Form Video Scripts', icon: <Video className="w-6 h-6" /> },
];

const IdeaBank = () => {
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState(ideaTypes[0].name);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setError('');
    setLoading(true);
    setIdeas([]);
    try {
      const res = await api.post('/api/strategy/generate-ideas', { topic, type: selectedType });
      setIdeas(res.data.data);
    } catch (err) {
      setError(err.normalizedMessage || 'Failed to generate ideas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a small notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-white p-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Content Idea Bank</h1>
          <p className="text-gray-400 mt-2">Generate instant content inspiration for any topic.</p>
        </motion.div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-6">
          <div>
            <label className="text-lg font-semibold block mb-2">1. Enter Your Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Artificial Intelligence, sustainable fashion..."
              className="w-full p-4 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-lg font-semibold block mb-2">2. Choose Idea Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ideaTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => setSelectedType(type.name)}
                  className={`p-4 flex flex-col items-center justify-center rounded-lg border-2 transition-all ${selectedType === type.name ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'}`}
                >
                  {type.icon}
                  <span className="mt-2 text-sm font-medium text-center">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-lg rounded-lg transition-colors disabled:bg-gray-600 flex items-center justify-center"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Lightbulb className="w-5 h-5 mr-2" /> Generate Ideas</>}
          </button>
        </div>

        {error && <div className="text-red-400 text-center mt-4">{error}</div>}

        <div className="mt-8">
          {loading && (
            <div className="text-center text-gray-400">AI is brainstorming...</div>
          )}
          {ideas.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-white">Generated Ideas:</h2>
              {ideas.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                >
                  <p 
                    className="text-gray-200 whitespace-pre-wrap"
                    onClick={() => handleCopyToClipboard(idea)}
                    title="Click to copy"
                    style={{ cursor: 'pointer' }}
                  >
                    {idea}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IdeaBank;