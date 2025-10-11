import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, Target, Sparkles, ArrowRight, Calendar, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';

const UserInputPanel = ({ onGenerate }) => {
  const [audience, setAudience] = useState('');
  const [contentType, setContentType] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [controller, setController] = useState(null);

  // --- NEW: State for persona generation ---
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [persona, setPersona] = useState('');
  const [personaError, setPersonaError] = useState('');

  const handleGeneratePersona = async () => {
    if (!audience) return;
    setIsGeneratingPersona(true);
    setPersona('');
    setPersonaError('');
    try {
      const res = await api.post('/api/strategy/generate-persona', { audience });
      setPersona(res.data.data);
    } catch (err) {
      setPersonaError(err.normalizedMessage || 'Failed to generate persona.');
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!audience || !contentType || !goal) return;
    if (startDate && !endDate) {
      setError('Please provide an end date if you specify a start date.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    const ac = new AbortController();
    setController(ac);

    const payload = {
      targetAudience: audience,
      topic: contentType,
      goals: goal,
      startDate: startDate || null,
      endDate: endDate || null,
    };
    try {
      const res = await api.post('/api/strategy/generate', payload, { signal: ac.signal });
      if (onGenerate) onGenerate(res.data.data);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        setError('Request cancelled by user.');
      } else {
        setError(err.normalizedMessage || 'Failed to generate strategy.');
      }
    } finally {
      setIsGenerating(false);
      setController(null);
    }
  };

  const handleCancel = () => {
    if (controller) {
      controller.abort();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-xl border border-gray-700 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">AI Content Generator</h2>
        <p className="text-gray-400">Define your strategy, and let our AI build your content plan.</p>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold"><User className="w-5 h-5 mr-2 text-blue-400" /> Target Audience Keywords</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., 'startup founders', 'busy tech professionals'"
              className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleGeneratePersona} 
              disabled={!audience || isGeneratingPersona}
              className="px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isGeneratingPersona ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <BrainCircuit className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {persona && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 text-gray-300"
            >
              <h3 className="font-semibold text-white mb-2">Generated Audience Persona:</h3>
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{persona}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {personaError && <div className="text-red-400 text-sm">{personaError}</div>}


        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold"><FileText className="w-5 h-5 mr-2 text-green-400" /> Content Topic / Type</label>
          <input type="text" value={contentType} onChange={(e) => setContentType(e.target.value)} placeholder="e.g., 'AI in Healthcare', 'Educational Content'" className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </motion.div>

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-2">
          <label className="flex items-center text-white font-semibold"><Target className="w-5 h-5 mr-2 text-purple-400" /> Primary Goal</label>
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., 'Increase Brand Awareness', 'Generate Leads'" className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </motion.div>

        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center text-white font-semibold"><Calendar className="w-5 h-5 mr-2 text-blue-400" /> Start Date (Optional)</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center text-white font-semibold"><Calendar className="w-5 h-5 mr-2 text-green-400" /> End Date (Optional)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={!startDate} min={startDate} className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" />
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleGenerateStrategy}
          disabled={!audience || !contentType || !goal || isGenerating}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-300 flex items-center justify-center ${(!audience || !contentType || !goal || isGenerating) ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'}`}
        >
          {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>Generating Strategy...</>) : (<><Sparkles className="w-5 h-5 mr-2" /> Generate Content Strategy</>)}
        </motion.button>
        {isGenerating && (<div className="mt-3 text-center"><button onClick={handleCancel} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Cancel</button></div>)}
      </div>
      {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-300">Error: {error}</motion.div>)}
    </motion.div>
  );
};

export default UserInputPanel;