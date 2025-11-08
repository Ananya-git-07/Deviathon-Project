import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>

        {/* User Input Panel Skeleton */}
        <div className="h-96 bg-gray-800 rounded-3xl mb-8"></div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-3xl p-6 h-32"></div>
          ))}
        </div>

        {/* Performance Chart */}
        <div className="bg-gray-800 rounded-3xl p-6 h-96 mb-8"></div>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-3xl p-6 h-36"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;