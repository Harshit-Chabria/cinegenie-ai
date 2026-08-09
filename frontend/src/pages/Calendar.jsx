import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, MapPin, Clock, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Calendar() {
  const [view, setView] = useState('Month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const eventTypes = {
    Shoot: 'bg-indigo-500',
    Editing: 'bg-amber-500',
    Meeting: 'bg-emerald-500',
    Delivery: 'bg-rose-500',
    Deadline: 'bg-red-500'
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({length: 35}, (_, i) => i + 1 - 3);

  const renderMonthView = () => (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-700/50">
        {days.map(day => (
          <div key={day} className="bg-gray-800/80 p-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">{day}</div>
        ))}
        {dates.map((date, i) => (
          <div key={i} className={`bg-gray-800/50 min-h-[100px] p-2 transition-colors hover:bg-gray-700/30 ${date <= 0 || date > 31 ? 'opacity-30' : ''}`}>
            <span className={`text-sm font-medium ${date === 15 ? 'bg-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-white' : 'text-gray-300'}`}>
              {date > 0 && date <= 31 ? date : (date <= 0 ? 30 + date : date - 31)}
            </span>
            {date === 15 && (
              <div className="mt-2 text-xs p-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate">Commercial Shoot</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden group">
          <div className="w-2 bg-indigo-500"></div>
          <div className="p-4 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex gap-2 items-center mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400">Shoot</span>
                <span className="text-sm text-gray-400"><Clock size={14} className="inline mr-1"/> 09:00 AM - 05:00 PM</span>
              </div>
              <h3 className="text-lg font-bold text-gray-100">Nike Commercial</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={14} /> Downtown Studio</span>
                <span className="flex items-center gap-1"><Video size={14} /> Nike Q3 Campaign</span>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors opacity-0 group-hover:opacity-100">Edit</button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Calendar</h1>
          <div className="flex items-center gap-4 mt-2">
            <button className="p-1 hover:bg-gray-800 rounded"><ChevronLeft size={20}/></button>
            <span className="text-lg font-medium">October 2023</span>
            <button className="p-1 hover:bg-gray-800 rounded"><ChevronRight size={20}/></button>
            <button className="ml-4 text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors">Today</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gray-800/80 p-1 rounded-lg flex text-sm">
            {['Month', 'List'].map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-md transition-colors ${view === v ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={20} /> Add Event
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(eventTypes).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-sm text-gray-400">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            {type}
          </div>
        ))}
      </div>

      {view === 'Month' ? renderMonthView() : renderListView()}

    </div>
  );
}
