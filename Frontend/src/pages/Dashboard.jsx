import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler } from 'chart.js';
import { TrendingUp, Users, MessageCircle, Target, Zap, BarChart3 } from 'lucide-react';
import UserInputPanel from '../components/UserInputPanel';
import DashboardSkeleton from '../components/DashboardSkeleton'; // <-- Import skeleton

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler);

const Dashboard = ({ onStrategyGenerated }) => {
  const [competitors, setCompetitors] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const api = (await import('../api/axios')).default;
        // Fetching a smaller, more relevant set of data for the dashboard
        const [compRes, trendsRes] = await Promise.all([
          api.get('/api/competitors'),
          api.get('/api/trends', { params: { topic: 'AI' } }), // Example topic
        ]);
        setCompetitors(compRes.data.data || []);
        setTrends(trendsRes.data.data || []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
        setError(err?.normalizedMessage || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- NEW: Render skeleton on loading state ---
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Derived KPIs
  const totalCompetitors = competitors.length;
  const totalPosts = competitors.reduce((sum, c) => sum + (c.recentPosts?.length || 0), 0);
  const positiveTrendPercent = trends.length > 0 ? Math.round((trends.filter(t => t.sentiment === 'Positive').length / trends.length) * 100) : 0;
  
  const kpiCards = [
    { title: 'Competitors Tracked', value: `${totalCompetitors}`, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Positive Trend Share', value: `${positiveTrendPercent}%`, icon: TrendingUp, color: 'from-green-500 to-green-600' },
    { title: 'Total Recent Posts', value: `${totalPosts}`, icon: MessageCircle, color: 'from-purple-500 to-purple-600' },
    { title: 'Avg Posts / Competitor', value: totalCompetitors > 0 ? `${Math.round(totalPosts / totalCompetitors)}` : '0', icon: Target, color: 'from-orange-500 to-orange-600' },
  ];

  // (This logic can be simplified or improved, but it's for demonstration)
  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{ label: 'Posts (all competitors)', data: [12, 19, 3, 5], borderColor: '#3b82f6', tension: 0.4 }, { label: 'Trends Discovered', data: [8, 15, 7, 9], borderColor: '#10b981', tension: 0.4 }]
  };

  const aiRecommendations = [
    { type: 'Content Strategy', title: 'Short-Form Video Series', impact: 'High', description: 'Create a 7-part series on AI automation tips.' },
    { type: 'Posting Time', title: 'Evening Optimization', impact: 'Medium', description: 'Shift posts to 7-9 PM for higher reach.' },
    { type: 'Hashtag Strategy', title: 'Niche Communities', impact: 'High', description: 'Target industry-specific hashtags for better leads.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {error && <div className="text-red-400 mb-4">Error: {error}</div>}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">AI Content Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time insights and AI-powered recommendations</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <UserInputPanel onGenerate={onStrategyGenerated} />
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}><card.icon className="w-6 h-6 text-white" /></div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold">{card.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 mb-8">
          <div className="flex items-center mb-6"><BarChart3 className="w-6 h-6 text-blue-400 mr-3" /><h2 className="text-xl font-bold">Performance Trends</h2></div>
          <div className="h-80"><Line data={performanceData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }, y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } } } }} /></div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiRecommendations.map((rec, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 hover:border-purple-500">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-sm text-purple-400 font-semibold">{rec.type}</span>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold ${rec.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{rec.impact} Impact</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
              <p className="text-gray-400 text-sm">{rec.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;