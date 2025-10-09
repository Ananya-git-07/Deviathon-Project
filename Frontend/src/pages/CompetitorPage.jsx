import React, { useState, useEffect } from 'react';
import { getCompetitors, addCompetitor } from '../api/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

// A dedicated skeleton component for this page's loading state
const CompetitorSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <SkeletonLoader className="h-8 w-1/2 mb-4" />
      <SkeletonLoader className="h-6 w-1/4 mb-4" />
      <div className="space-y-2">
        <SkeletonLoader className="h-5 w-full" />
        <SkeletonLoader className="h-5 w-5/6" />
      </div>
    </div>
  </div>
);


const CompetitorPage = () => {
  const [handle, setHandle] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompetitors = async () => {
    setIsListLoading(true);
    try {
      const response = await getCompetitors();
      setCompetitors(response.data.data);
    } catch (err) {
      setError('Could not fetch competitor list.');
      console.error(err);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handle) return;

    setIsAdding(true);
    setError(null);

    try {
      await addCompetitor({ platform: 'YouTube', handle });
      setHandle('');
      fetchCompetitors();
    } catch (err) {
      // THIS IS THE KEY CHANGE: Display specific error from the backend
      setError(err.response?.data?.error || 'Failed to add competitor. Check the handle and try again.');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Competitor Tracker</h1>
      <p className="text-gray-600 mb-6">Track your competitors' latest YouTube content.</p>

      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Enter YouTube handle (e.g., mkbhd)"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 disabled:bg-blue-300 transition-colors duration-200"
        >
          {isAdding ? 'Adding...' : 'Track Competitor'}
        </button>
      </form>
      
      {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-3 rounded-md">{error}</p>}
      
      {isListLoading ? (
        <CompetitorSkeleton />
      ) : (
        <div className="space-y-6">
          {competitors.map((competitor) => (
            <div key={competitor._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-800">{competitor.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Platform: {competitor.platform}</p>
              <h3 className="font-semibold mb-2">Recent Posts:</h3>
              <ul className="list-disc list-inside space-y-2">
                {competitor.recentPosts.map((post) => (
                  <li key={post.postId}>
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline transition-colors">
                      {post.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {competitors.length === 0 && !isListLoading && (
            <p className="text-center text-gray-500 py-10">You are not tracking any competitors yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorPage;