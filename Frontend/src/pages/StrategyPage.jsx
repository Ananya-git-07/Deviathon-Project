import React, { useState } from 'react';
import { generateStrategy } from '../api/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

// A dedicated skeleton component for this page's loading state
const StrategySkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
    <SkeletonLoader className="h-8 w-3/4" />
    <div className="border-b pb-4">
      <SkeletonLoader className="h-6 w-1/4 mb-2" />
      <SkeletonLoader className="h-5 w-full" />
    </div>
    <div className="border-b pb-4">
      <SkeletonLoader className="h-6 w-1/3 mb-2" />
      <SkeletonLoader className="h-5 w-2/3" />
    </div>
    <div>
      <SkeletonLoader className="h-6 w-1/2 mb-4" />
      <div className="space-y-3">
        <SkeletonLoader className="h-16 w-full" />
        <SkeletonLoader className="h-16 w-full" />
        <SkeletonLoader className="h-16 w-full" />
      </div>
    </div>
  </div>
);


const StrategyPage = () => {
  const [formData, setFormData] = useState({
    targetAudience: '',
    topic: '',
    goals: '',
  });
  const [strategy, setStrategy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStrategy(null);

    try {
      const response = await generateStrategy(formData);
      setStrategy(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate strategy. The AI might be busy. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Strategy Generator</h1>
        <p className="text-gray-600 mb-6">Define your goals and let the AI build a 30-day content plan for you.</p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          {/* Form inputs remain the same */}
           <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience</label>
            <input type="text" name="targetAudience" id="targetAudience" value={formData.targetAudience} onChange={handleChange} placeholder="e.g., Gen Z gamers" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Primary Topic</label>
            <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange} placeholder="e.g., New indie game releases" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-gray-700">Core Goals</label>
            <textarea name="goals" id="goals" value={formData.goals} onChange={handleChange} placeholder="e.g., Build a community and drive pre-orders" required rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 disabled:bg-blue-300 transition-colors duration-200">
            {isLoading ? 'Generating Plan...' : 'Generate 30-Day Plan'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        {isLoading && <StrategySkeleton />}
        {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
        {strategy && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Your 30-Day Content Strategy</h2>
            
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-700">Blog Title Suggestion</h3>
              <p className="text-lg">{strategy.generatedPlan.blogTitle}</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-700">Suggested Formats & Frequency</h3>
              <p>
                {strategy.generatedPlan.suggestedFormats.join(', ')} at a frequency of {strategy.generatedPlan.postFrequency}.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Content Calendar</h3>
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                {strategy.generatedPlan.calendar.map((item) => (
                  <div key={item.day} className="p-3 bg-slate-50 rounded-md border hover:border-blue-300 transition-colors">
                    <p className="font-bold">Day {item.day}: {item.title}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Format:</strong> {item.format} on {item.platform} | <strong>Best Time:</strong> {item.postTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyPage;