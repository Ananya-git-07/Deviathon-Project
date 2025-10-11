import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

const statusOptions = ['To Do', 'In Progress', 'Completed'];

const EditContentModal = ({ isOpen, onClose, contentItem, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contentItem) {
      setFormData(contentItem);
    }
  }, [contentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (newStatus) => {
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Edit Content for Day {formData.day}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <textarea name="title" value={formData.title} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white" rows="2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Format</label><input type="text" name="format" value={formData.format} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Platform</label><input type="text" name="platform" value={formData.platform} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-300 mb-1">Time</label><input type="text" name="postTime" value={formData.postTime} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white" /></div>
              </div>
              
              {/* --- NEW: Rationale field --- */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">AI Rationale</label>
                <textarea name="rationale" value={formData.rationale} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs" rows="3" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex space-x-2">{statusOptions.map(status => (<button key={status} type="button" onClick={() => handleStatusChange(status)} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${formData.status === status ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>{status}</button>))}</div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 flex items-center disabled:bg-gray-500"><Save className="w-4 h-4 mr-2" />{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditContentModal;