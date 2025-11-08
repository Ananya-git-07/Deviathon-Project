import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Info, Share, CheckCircle, Clock, Loader, Lightbulb, Wand2, RotateCcw } from 'lucide-react';
import Papa from 'papaparse';
import ReactMarkdown from 'react-markdown';
import EditContentModal from '../components/EditContentModal';
import ExpandIdeaModal from '../components/ExpandIdeaModal';

// DND-Kit Imports
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const useDnDSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
};

const SortableDay = ({ day, handleDayClick, handleExpandClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.date.toDateString() });
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? '0 0 15px rgba(0,0,0,0.5)' : 'none',
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 border-green-500';
      case 'In Progress': return 'bg-yellow-500/20 border-yellow-500';
      default: return 'bg-blue-500/20 border-blue-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`aspect-square flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 relative group p-1 text-center border-2 ${day.isCurrentMonth ? 'text-white' : 'text-gray-500'} ${day.isToday ? 'bg-indigo-500/30 border-indigo-500' : 'border-transparent'} ${day.content ? `${getStatusClass(day.content.status)} hover:bg-gray-700` : 'hover:bg-gray-800/50'}`}
    >
      <div {...listeners} className="absolute inset-0 cursor-grab" />
      <div onClick={() => day.content && handleDayClick(day.content)} className="relative z-[2] w-full h-full flex flex-col items-center justify-center">
        <span>{day.day}</span>
        {day.content && <div className="text-xs truncate w-full mt-1 px-1 pointer-events-none">{day.content.title}</div>}
      </div>
      {day.content && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handleExpandClick(day.content); }}
            className="absolute top-1 right-1 p-1 bg-gray-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-[3]"
            title="Expand this idea"
          >
            <Wand2 className="w-3 h-3 text-purple-300" />
          </button>
          <div className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 z-10 pointer-events-none border border-gray-600">
            <h4 className="font-bold text-sm">{day.content.title}</h4>
            <p className="text-xs text-gray-300 mt-1">{day.content.format} on {day.content.platform} ({day.content.postTime})</p>
            <div className="mt-2 pt-2 border-t border-gray-700 flex items-start">
              <Lightbulb className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">{day.content.rationale}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


const CalendarPage = () => {
  const { strategyId } = useParams();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [ideaToExpand, setIdeaToExpand] = useState(null);
  
  const [calendarDays, setCalendarDays] = useState([]);
  const [activeDate, setActiveDate] = useState(new Date());

  const [undoAction, setUndoAction] = useState(null);
  const undoTimeoutRef = useRef(null);
  
  const sensors = useDnDSensors();

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // --- THIS IS THE RESTORED DATA FETCHING LOGIC ---
    const fetchStrategy = async () => {
      if (!strategyId) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/strategy/${strategyId}`);
        const fetchedStrategy = res.data.data;
        setStrategy(fetchedStrategy);
        const effectiveStartDate = new Date(fetchedStrategy.startDate || fetchedStrategy.createdAt);
        setActiveDate(effectiveStartDate);
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load strategy');
      } finally {
        setLoading(false); // This line is crucial
      }
    };
    fetchStrategy();
  }, [strategyId]);

  const startDate = useMemo(() => {
    // --- THIS IS THE RESTORED LOGIC ---
    if (!strategy) return null;
    const date = new Date(strategy.startDate || strategy.createdAt);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [strategy]);
  
  useEffect(() => {
    // --- THIS IS THE RESTORED LOGIC ---
    if (!strategy?.generatedPlan?.calendar || !startDate) {
      setCalendarDays([]);
      return;
    }
    const scheduledContent = (strategy.generatedPlan.calendar || []).reduce((acc, item) => {
      const contentDate = new Date(startDate);
      contentDate.setDate(startDate.getDate() + item.day - 1);
      acc[contentDate.toDateString()] = item;
      return acc;
    }, {});

    const generateDays = () => {
      const days = [];
      const firstDayOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
      const startCalDate = new Date(firstDayOfMonth);
      startCalDate.setDate(startCalDate.getDate() - firstDayOfMonth.getDay());
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startCalDate);
        currentDate.setDate(startCalDate.getDate() + i);
        days.push({
          date: currentDate,
          isCurrentMonth: currentDate.getMonth() === activeDate.getMonth(),
          isToday: currentDate.toDateString() === new Date().toDateString(),
          content: scheduledContent[currentDate.toDateString()],
          day: currentDate.getDate()
        });
      }
      return days;
    };
    setCalendarDays(generateDays());
  }, [strategy, startDate, activeDate]);


  const handleDayClick = (content) => {
    if (content) {
      setSelectedContent(content);
      setIsEditModalOpen(true);
    }
  };

  const handleExpandClick = (idea) => {
    setIdeaToExpand(idea);
    setIsExpandModalOpen(true);
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

  const handleUndo = () => {
    if (undoAction && undoAction.previousStrategy) {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      setStrategy(undoAction.previousStrategy);
      setUndoAction(null);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    
    const previousStrategy = JSON.parse(JSON.stringify(strategy));
    
    const draggedItem = previousStrategy.generatedPlan.calendar.find(item => {
        const itemDate = new Date(startDate);
        itemDate.setDate(startDate.getDate() + item.day - 1);
        return itemDate.toDateString() === active.id;
    });

    const targetDate = new Date(over.id);
    const targetItem = previousStrategy.generatedPlan.calendar.find(item => {
        const itemDate = new Date(startDate);
        itemDate.setDate(startDate.getDate() + item.day - 1);
        return itemDate.toDateString() === over.id;
    });

    if (!draggedItem) return;

    const newDayNumber = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const newCalendarPlan = [];
    for (const item of previousStrategy.generatedPlan.calendar) {
      if (targetItem && item.day === targetItem.day) {
        continue;
      }
      if (item.day === draggedItem.day) {
        newCalendarPlan.push({ ...item, day: newDayNumber });
      } 
      else {
        newCalendarPlan.push(item);
      }
    }

    setStrategy(prev => ({
        ...prev,
        generatedPlan: { ...prev.generatedPlan, calendar: newCalendarPlan }
    }));
    
    const commitChange = async () => {
      try {
        await api.put(`/api/strategy/${strategyId}/calendar/${draggedItem.day}`, { day: newDayNumber });
      } catch (err) {
        setError('Failed to save the change. Reverting.');
        setStrategy(previousStrategy); 
      } finally {
        setUndoAction(null);
      }
    };
    
    if (targetItem) {
      setUndoAction({ previousStrategy, draggedItem, deletedItem: targetItem });
      undoTimeoutRef.current = setTimeout(commitChange, 7000);
    } else {
      commitChange();
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Loading Strategy...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center text-red-400">Error: {error}</div>;
  if (!strategy || !strategy.generatedPlan) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">Strategy not found.</div>;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  return (
    <>
      <EditContentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} contentItem={selectedContent} onSave={handleSaveContent} />
      <ExpandIdeaModal isOpen={isExpandModalOpen} onClose={() => setIsExpandModalOpen(false)} idea={ideaToExpand} />
      
      <AnimatePresence>
        {undoAction && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 shadow-lg rounded-lg p-4 flex items-center space-x-4"
          >
            <p className="text-sm text-gray-300">
              Moved <span className="font-semibold text-white">{undoAction.draggedItem.title.substring(0, 20)}...</span>
              {undoAction.deletedItem && ` and removed ${undoAction.deletedItem.title.substring(0, 20)}...`}
            </p>
            <button
              onClick={handleUndo}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center mb-6"><Info className="w-6 h-6 text-blue-400 mr-3" /><h2 className="text-xl font-bold">Strategy Overview</h2></div>
                <div className="space-y-4 text-gray-300">
                  <div><h3 className="font-semibold text-white">Blog Title Suggestion</h3><p>{strategy.generatedPlan.blogTitle}</p></div>
                  <div><h3 className="font-semibold text-white">Recommended Frequency</h3><p>{strategy.generatedPlan.postFrequency}</p></div>
                  <hr className="border-gray-700" />
                  <div><h3 className="font-semibold text-white">Primary Goal</h3><p>{strategy.goals}</p></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center mb-6"><Info className="w-6 h-6 text-purple-400 mr-3" /><h2 className="text-xl font-bold">Audience Persona</h2></div>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                  <ReactMarkdown>{strategy.audiencePersona}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center"><Calendar className="w-6 h-6 text-green-400 mr-3" /><h2 className="text-xl font-bold">Content Calendar</h2></div>
                  <div className="flex space-x-2">
                    <select value={activeDate.getMonth()} onChange={(e) => setActiveDate(new Date(activeDate.getFullYear(), parseInt(e.target.value), 1))} className="bg-gray-700 rounded-lg px-3 py-1 text-sm">{monthNames.map((month, index) => (<option key={index} value={index}>{month}</option>))}</select>
                    <select value={activeDate.getFullYear()} onChange={(e) => setActiveDate(new Date(parseInt(e.target.value), activeDate.getMonth(), 1))} className="bg-gray-700 rounded-lg px-3 py-1 text-sm">{[...Array(3)].map((_, i) => (<option key={i} value={new Date().getFullYear() - 1 + i}>{new Date().getFullYear() - 1 + i}</option>))}</select>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-7 gap-1 mb-4">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="text-center text-gray-400 text-sm font-semibold py-2">{day}</div>))}</div>
                    <div className="grid grid-cols-7 gap-1">
                      <SortableContext items={calendarDays.map(d => d.date.toDateString())}>
                        {calendarDays.map((day) => (
                          <SortableDay key={day.date.toDateString()} day={day} handleDayClick={handleDayClick} handleExpandClick={handleExpandClick} />
                        ))}
                      </SortableContext>
                    </div>
                </DndContext>
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