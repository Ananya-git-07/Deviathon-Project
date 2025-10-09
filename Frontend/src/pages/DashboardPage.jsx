import React, { useState } from 'react';
import { fetchTrends } from '../api/apiService';
import TrendChart from '../components/TrendChart';
import SkeletonLoader from '../components/SkeletonLoader';

const getPlatformBadgeColor = (platform) => {
  if (platform.includes('YouTube')) return 'bg-red-100 text-red-800 border-red-200';
  if (platform.includes('Reddit')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (platform.includes('Twitter')) return 'bg-blue-100 text-blue-800 border-blue-200';
  return 'bg-green-100 text-green-800 border-green-200';
};

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg space-y-4 animate-pulse">
      <SkeletonLoader className="h-8 w-3/4" />
      <SkeletonLoader className="h-16 w-full" />
      <SkeletonLoader className="h-16 w-full" />
      <SkeletonLoader className="h-16 w-full" />
      <SkeletonLoader className="h-16 w-full" />
    </div>
    <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg flex items-center justify-center animate-pulse">
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
      setError(
        err.response?.data?.error || 
        'Failed to fetch trends. Please try again later.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-1">
          Trend Discovery
        </h1>
        <p className="text-gray-600 text-lg">
          Enter a topic to discover real-time trends from across the web
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., sustainable fashion"
          className="flex-grow px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm text-base"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto">
          <div className="text-red-700 text-center bg-red-50 border border-red-200 p-4 rounded-xl shadow-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <DashboardSkeleton />}

      {/* Results Section */}
      {trends.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Topics List */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Trending Topics
              </h2>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {trends.length} results
              </span>
            </div>
            <ul className="space-y-3">
              {trends.map((trend, index) => (
                <li
                  key={index}
                  className="group border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-gray-800 font-medium flex-grow group-hover:text-blue-700 transition-colors">
                      {trend.keyword}
                    </p>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border whitespace-nowrap ${getPlatformBadgeColor(
                        trend.platform
                      )}`}
                    >
                      {trend.platform}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-1">
            <TrendChart trends={trends} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;