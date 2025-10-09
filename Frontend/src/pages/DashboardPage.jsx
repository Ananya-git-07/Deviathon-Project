import React, { useState } from 'react';
import { fetchTrends } from '../api/apiService';
import TrendChart from '../components/TrendChart';
import SkeletonLoader from '../components/SkeletonLoader';

const getPlatformBadgeColor = (platform) => {
  if (platform.includes('YouTube')) return 'bg-red-100 text-red-800';
  if (platform.includes('Reddit')) return 'bg-orange-100 text-orange-800';
  if (platform.includes('Twitter')) return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800'; // For News, AI, etc.
};

// A dedicated skeleton component for this page's loading state
const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
      <SkeletonLoader className="h-8 w-3/4" />
      <SkeletonLoader className="h-12 w-full" />
      <SkeletonLoader className="h-12 w-full" />
      <SkeletonLoader className="h-12 w-full" />
      <SkeletonLoader className="h-12 w-full" />
    </div>
    <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
      <SkeletonLoader className="h-64 w-64 rounded-full" />
    </div>
  </div>
);

const DashboardPage = () => {
  const [topic, setTopic] = useState('');
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setError(null);
    setTrends([]);

    try {
      const response = await fetchTrends(topic);
      setTrends(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch trends. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Trend Discovery</h1>
        <p className="text-gray-600">Enter a topic to discover real-time trends from across the web.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., sustainable fashion"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}

      {isLoading && <DashboardSkeleton />}

      {trends.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Trending Topics ({trends.length})</h2>
            <ul className="space-y-4">
              {trends.map((trend, index) => (
                <li key={index} className="border-b pb-2 last:border-b-0 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-md transition-colors">
                  <p className="text-gray-800">{trend.keyword}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPlatformBadgeColor(trend.platform)}`}>
                    {trend.platform}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-1">
            <TrendChart trends={trends} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;