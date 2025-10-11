import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Info, Share, CheckCircle, Clock, Loader, Lightbulb } from 'lucide-react';
import Papa from 'papaparse';
import EditContentModal from '../components/EditContentModal';
import ReactMarkdown from 'react-markdown'; // <-- Import ReactMarkdown

const CalendarPage = () => {
  const { strategyId } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    if (!strategyId) return;
    const fetchStrategy = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/strategy/${strategyId}`);
        const fetchedStrategy = res.data.data;
        setStrategy(fetchedStrategy);
        const effectiveStartDate = new Date(fetchedStrategy.startDate || fetchedStrategy.createdAt);
        setSelectedMonth(effectiveStartDate.getMonth());
        setSelectedYear(effectiveStartDate.getFullYear());
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load strategy');
      } finally {
        setLoading(false);
      }
    };
    fetchStrategy();
  }, [strategyId]);

  const startDate = useMemo(() => strategy ? new Date(strategy.startDate || strategy.createdAt) : null, [strategy]);
  const plan = useMemo(() => strategy?.generatedPlan || null, [strategy]);

  const handleDayClick = (content) => {
    if (content) {
      setSelectedContent(content);
      setIsModalOpen(true);
    }
  };

  const handleSaveContent = async (updatedContent) => {
    try {
      const res = await api.put(`/api/strategy/${strategyId}/calendar/${updatedContent.day}`, updatedContent);
      setStrategy(res.data.data);
    } catch (err) {
      console.error("Failed to save content", err);
      throw new Error(err?.response?.data?.error || 'An error occurred while saving.');
    }
  };

  const handleExportCSV = () => {
    if (!plan?.calendar || !startDate) return;
    const csvData = plan.calendar.map(item => {
      const contentDate = new Date(startDate);
      contentDate.setDate(startDate.getDate() + item.day - 1);
      return { Date: contentDate.toISOString().split('T')[0], Day: item.day, Title: item.title, Format: item.format, Platform: item.platform, Post_Time: item.postTime, Status: item.status, Rationale: item.rationale };
    });
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const safeFilename = (strategy.topic || 'content-plan').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeFilename}_strategy.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scheduledContent = useMemo(() => {
    if (!plan?.calendar || !startDate) return {};
    return (plan.calendar || []).reduce((acc, item) => {
      const contentDate = new Date(startDate);
      contentDate.setDate(startDate.getDate() + item.day - 1);
      acc[contentDate.toDateString()] = item;
      return acc;
    }, {});
  }, [plan, startDate]);

  const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const startCalDate = new Date(firstDay);
    startCalDate.setDate(startCalDate.getDate() - firstDay.getDay());
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startCalDate);
      currentDate.setDate(startCalDate.getDate() + i);
      days.push({
        date: currentDate,
        isCurrentMonth: currentDate.getMonth() === selectedMonth,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        content: scheduledContent[currentDate.toDateString()],
        day: currentDate.getDate()
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 border-green-500';
      case 'In Progress': return 'bg-yellow-500/20 border-yellow-500';
      default: return 'bg-blue-500/20 border-blue-500';
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Loading Strategy...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center text-red-400">Error: {error}</div>;
  if (!strategy || !plan) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Strategy not found.</div>;

  return (
    <>
      <EditContentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contentItem={selectedContent} onSave={handleSaveContent} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">AI-Generated Content Plan</h1>
              <p className="text-gray-400 mt-2">A plan for "{strategy.topic}" starting {startDate.toLocaleDateString()}</p>
            </div>
            <button onClick={handleExportCSV} className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-blue-700 transition-all">
              <Share className="w-4 h-4 mr-2" /> Export to CSV
            </button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center mb-6"><Info className="w-6 h-6 text-blue-400 mr-3" /><h2 className="text-xl font-bold">Strategy Overview</h2></div>
                <div className="space-y-4 text-gray-300">
                  <div><h3 className="font-semibold text-white">Blog Title Suggestion</h3><p>{plan.blogTitle}</p></div>
                  <div><h3 className="font-semibold text-white">Suggested Formats</h3><p>{Array.isArray(plan.suggestedFormats) ? plan.suggestedFormats.join(', ') : 'N/A'}</p></div>
                  <div><h3 className="font-semibold text-white">Recommended Frequency</h3><p>{plan.postFrequency}</p></div>
                  <hr className="border-gray-700" />
                  <div><h3 className="font-semibold text-white">Primary Goal</h3><p>{strategy.goals}</p></div>
                </div>
              </div>
              {/* --- NEW: Persona Card --- */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center mb-6"><Info className="w-6 h-6 text-purple-400 mr-3" /><h2 className="text-xl font-bold">Audience Persona</h2></div>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                  <ReactMarkdown>{strategy.audiencePersona}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center"><Calendar className="w-6 h-6 text-green-400 mr-3" /><h2 className="text-xl font-bold">Content Calendar</h2></div>
                  <div className="flex space-x-2"><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm">{monthNames.map((month, index) => (<option key={index} value={index}>{month}</option>))}</select><select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-gray-700 text-white rounded-lg px-3 py-1 text-sm">{[...Array(3)].map((_, i) => (<option key={i} value={new Date().getFullYear() - 1 + i}>{new Date().getFullYear() - 1 + i}</option>))}</select></div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">{day}</div>))}</div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.05 }} onClick={() => handleDayClick(day.content)} className={`aspect-square flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 relative group p-1 text-center border-2 ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'} ${day.isToday ? 'bg-indigo-500/30 border-indigo-500' : 'border-transparent'} ${day.content ? `${getStatusClass(day.content.status)} cursor-pointer hover:bg-gray-700` : 'hover:bg-gray-800/50'}`}>
                      <span>{day.day}</span>
                      {day.content && <div className="text-xs truncate w-full mt-1 px-1">{day.content.title}</div>}
                      {/* --- NEW: Rationale Tooltip --- */}
                      {day.content && (
                        <div className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none border border-gray-600">
                          <h4 className="font-bold text-sm">{day.content.title}</h4>
                          <p className="text-xs text-gray-300 mt-1">{day.content.format} on {day.content.platform} ({day.content.postTime})</p>
                          <div className="mt-2 pt-2 border-t border-gray-700 flex items-start">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400">{day.content.rationale}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-center space-x-4 text-xs flex-wrap gap-2">
                  <div className="flex items-center"><CheckCircle className="w-3 h-3 text-green-500 mr-1.5" /><span className="text-gray-400">Completed</span></div>
                  <div className="flex items-center"><Loader className="w-3 h-3 text-yellow-500 mr-1.5" /><span className="text-gray-400">In Progress</span></div>
                  <div className="flex items-center"><Clock className="w-3 h-3 text-blue-500 mr-1.5" /><span className="text-gray-400">To Do</span></div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-1.5"></div><span className="text-gray-400">Today</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CalendarPage;