import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TrendChart = ({ trends }) => {
  // Process data for the chart
  const platformCounts = trends.reduce((acc, trend) => {
    const platform = trend.platform;
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(platformCounts),
    datasets: [
      {
        label: '# of Trends',
        data: Object.values(platformCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // YouTube
          'rgba(54, 162, 235, 0.8)',  // Reddit
          'rgba(255, 206, 86, 0.8)',  // Twitter
          'rgba(75, 192, 192, 0.8)',  // Google / AI / News
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Trend Source Breakdown</h2>
      <div className="h-64 flex items-center justify-center">
        <Doughnut data={data} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default TrendChart;