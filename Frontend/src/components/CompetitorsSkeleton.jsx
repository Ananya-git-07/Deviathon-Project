import React from 'react';

const CompetitorsSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-10 bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-80"></div>
          </div>
          <div className="h-12 bg-gray-700 rounded-xl w-48"></div>
        </div>

        {/* Competitor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-3xl p-6 h-56"></div>
          ))}
        </div>
        
        {/* Chart Skeleton */}
        <div className="bg-gray-800 rounded-3xl p-6 h-96"></div>
      </div>
    </div>
  );
};

export default CompetitorsSkeleton;