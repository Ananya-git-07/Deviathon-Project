import React from 'react';

const AnalyticsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-10 bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-80"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 bg-gray-700 rounded-lg w-64"></div>
            <div className="h-10 bg-gray-700 rounded-lg w-10"></div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-3xl p-6 h-80"></div>
          <div className="bg-gray-800 rounded-3xl p-6 h-80"></div>
        </div>

        {/* Trend List */}
        <div className="bg-gray-800 rounded-3xl p-6">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;