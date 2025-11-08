import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, Award, Search, Youtube, Twitter, Hash, Smile, Frown, Meh, Link as LinkIcon } from 'lucide-react';
import { FaReddit, FaGoogle } from 'react-icons/fa';
import AnalyticsSkeleton from '../components/AnalyticsSkeleton';
import toast from 'react-hot-toast';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController);

const Analytics = () => {
  const [topic, setTopic] = useState('AI');
  const [topicInput, setTopicInput] = useState('AI');
  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [trendsError, setTrendsError] = useState(null);

  const fetchTrends = useCallback(async () => {
    if (!topic) return;
    try {
      setLoadingTrends(true);
      setTrendsError(null);
      const res = await api.get('/api/trends', { params: { topic } });
      setTrends(res.data.data || []);
    } catch (err) {
      const errorMessage = err?.normalizedMessage || 'Failed to load trends';
      setTrendsError(errorMessage);
      toast.error(errorMessage);
      setTrends([]);
    } finally {
      setLoadingTrends(false);
    }
  }, [topic]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);
  
  const handleTopicSearch = (e) => {
    e.preventDefault();
    if (topicInput.trim()) {
      setTopic(topicInput.trim());
    }
  };
  
  if (loadingTrends) {
    return <AnalyticsSkeleton />;
  }

  const platformBuckets = { 'YouTube': 0, 'Twitter': 0, 'Reddit': 0, 'Google Trends (AI)': 0 };
  const sentimentBuckets = { 'Positive': 0, 'Negative': 0, 'Neutral': 0 };
  trends.forEach((t) => {
    if (platformBuckets.hasOwnProperty(t.platform)) platformBuckets[t.platform]++;
    if (sentimentBuckets.hasOwnProperty(t.sentiment)) sentimentBuckets[t.sentiment]++;
  });

  const platformData = {
    labels: Object.keys(platformBuckets),
    datasets: [{
      data: Object.values(platformBuckets),
      backgroundColor: ['rgba(255, 0, 0, 0.7)', 'rgba(29, 161, 242, 0.7)', 'rgba(255, 69, 0, 0.7)', 'rgba(52, 168, 83, 0.7)'],
      borderColor: ['#1f2937'],
      borderWidth: 2
    }]
  };

  const sentimentData = {
    labels: Object.keys(sentimentBuckets),
    datasets: [{
      data: Object.values(sentimentBuckets),
      backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(107, 114, 128, 0.7)'],
      borderColor: ['#1f2937'],
      borderWidth: 2
    }]
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'YouTube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'Twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'Reddit': return <FaReddit className="w-4 h-4 text-orange-500" />;
      case 'Google Trends (AI)': return <FaGoogle className="w-4 h-4 text-green-500" />;
      default: return <Hash className="w-4 h-4 text-gray-400" />;
    }
  };
  
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return <Smile className="w-4 h-4 text-green-400" />;
      case 'Negative': return <Frown className="w-4 h-4 text-red-400" />;
      default: return <Meh className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Content Analysis</h1>
              <p className="text-gray-400 mt-2">Analyze trends for any topic to optimize your strategy.</p>
            </div>
            <form onSubmit={handleTopicSearch} className="flex items-center space-x-2">
              <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} placeholder="Enter a topic..." className="w-64 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"><Search className="w-5 h-5 text-white" /></button>
            </form>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center mb-6"><PieChart className="w-6 h-6 text-blue-400 mr-3" /><h2 className="text-xl font-bold">Trend Source Distribution</h2></div>
            <div className="h-64 flex items-center justify-center"><Doughnut data={platformData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }} /></div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center mb-6"><Smile className="w-6 h-6 text-green-400 mr-3" /><h2 className="text-xl font-bold">AI-Powered Sentiment</h2></div>
            <div className="h-64 flex items-center justify-center"><Doughnut data={sentimentData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }} /></div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
          <div className="flex items-center mb-6"><Award className="w-6 h-6 text-purple-400 mr-3" /><h2 className="text-xl font-bold">Trending Topics for "{topic}"</h2></div>
          {trendsError && !loadingTrends && <div className="text-center text-red-400">Error: {trendsError}</div>}
          {!trendsError && !loadingTrends && trends.length === 0 && <div className="text-center text-gray-400">No trends found for this topic.</div>}
          
          {!trendsError && !loadingTrends && trends.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((trend, index) => {
                const destinationUrl = trend.link || `https://www.google.com/search?q=${encodeURIComponent(trend.keyword)}`;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, borderColor: '#a855f7' }}
                    className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700 transition-colors duration-300"
                  >
                    <div className="flex items-start">
                      <div className="mr-4 mt-1 flex-shrink-0">{getPlatformIcon(trend.platform)}</div>
                      <div className="flex-1">
                        <a
                          href={destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold text-sm leading-tight group hover:text-purple-300 transition-colors"
                        >
                          {trend.keyword}
                          <LinkIcon className="w-3 h-3 inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <div className="flex items-center text-xs text-gray-400 mt-2 gap-x-3">
                          <span>{trend.platform}</span>
                          <div className="flex items-center gap-x-1">{getSentimentIcon(trend.sentiment)} {trend.sentiment}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
