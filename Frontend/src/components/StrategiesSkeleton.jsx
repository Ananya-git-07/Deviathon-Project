import React from 'react';

const StrategiesSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-80"></div>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-6 h-60"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategiesSkeleton;