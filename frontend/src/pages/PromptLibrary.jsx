import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Plus, Copy, Trash2, Edit2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const prompts = [
    { id: 1, title: 'Cinematic B-Roll Planner', desc: 'Generates a shot list for cinematic b-roll with pacing notes.', category: 'Commercial', mode: 'Director', isOfficial: true, uses: 1205 },
    { id: 2, title: 'Color Grade Analyzer', desc: 'Analyzes a reference image prompt to suggest DaVinci Resolve nodes.', category: 'Custom', mode: 'Editor', isOfficial: false, uses: 45 },
    { id: 3, title: 'Wedding Day Timeline', desc: 'Creates a robust videography timeline for a wedding day.', category: 'Wedding', mode: 'Producer', isOfficial: true, uses: 890 }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Prompt Library</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2"><MessageSquare size={16} /> Enhance your AI workflow with pre-built prompts</p>
        </div>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg flex items-center gap-2 transition-colors shadow-lg">
          <Plus size={20} /> Save Custom Prompt
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {['All', 'Wedding', 'Commercial', 'Corporate', 'Custom'].map(tab => (
          <button key={tab} onClick={() => setActiveCategory(tab)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeCategory === tab ? 'bg-indigo-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map(prompt => (
          <motion.div key={prompt.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/60 transition-all flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 ${prompt.isOfficial ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {prompt.isOfficial ? <Zap size={12} className="fill-amber-400" /> : <MessageSquare size={12} />}
                {prompt.isOfficial ? 'Official' : 'User'}
              </span>
              <span className="text-xs text-gray-500">{prompt.uses} uses</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-100 mb-2">{prompt.title}</h3>
            <p className="text-gray-400 text-sm mb-6 flex-1">{prompt.desc}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300">{prompt.category}</span>
              <span className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-300">{prompt.mode}</span>
            </div>
            
            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-700/50">
              <button
                onClick={() => navigate('/ai-assistant')}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                <Play size={16} /> Use in AI
              </button>
              <button className="p-2 bg-gray-700/50 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors tooltip" title="Copy Text">
                <Copy size={18} />
              </button>
              {!prompt.isOfficial && (
                <>
                  <button className="p-2 bg-gray-700/50 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"><Edit2 size={18} /></button>
                  <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
