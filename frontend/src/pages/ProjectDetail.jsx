import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MoreHorizontal, MessageSquare, List, AlignLeft, Layout, Type, CheckSquare, Folder, PlayCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    { id: 'Overview', icon: <AlignLeft size={16}/> },
    { id: 'AI Assistant', icon: <MessageSquare size={16}/> },
    { id: 'Shot List', icon: <List size={16}/> },
    { id: 'Script', icon: <Type size={16}/> },
    { id: 'Storyboard', icon: <Layout size={16}/> },
    { id: 'Tasks', icon: <CheckSquare size={16}/> },
    { id: 'Files', icon: <Folder size={16}/> }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"><ArrowLeft size={20}/></Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Nike Summer Campaign</h1>
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-md border border-indigo-500/20 font-medium tracking-wide">Pre-production</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Client: Nike Inc. • Shoot Date: Nov 15, 2023</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <PlayCircle size={18} /> Open AI Chat
          </button>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"><MoreHorizontal size={20}/></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-800 flex overflow-x-auto scrollbar-hide flex-shrink-0 bg-gray-900/50 backdrop-blur-sm z-0">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}
          >
            {tab.icon} {tab.id}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-900/50">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto h-full"
          >
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200">Project Description</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">High-energy 30s commercial focusing on the new running shoe line. Emphasize dynamic movement, urban environments, and sunrise lighting. Target audience: 18-35 athletic individuals.</p>
                  </div>
                  
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 text-center group">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Type size={24}/></div>
                        <span className="text-sm font-medium text-gray-300">Generate Script</span>
                      </button>
                      <button className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 text-center group">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors"><List size={24}/></div>
                        <span className="text-sm font-medium text-gray-300">Create Shot List</span>
                      </button>
                      <button className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors flex flex-col items-center gap-3 text-center group">
                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors"><Layout size={24}/></div>
                        <span className="text-sm font-medium text-gray-300">Build Storyboard</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Details</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Budget</span><span className="font-medium">$15,000</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-right">Downtown LA</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Aspect Ratio</span><span className="font-medium">16:9, 9:16</span></div>
                    </div>
                  </div>

                  <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">Deliverables</h3>
                    <div className="space-y-3 text-sm">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500/50" />
                        <span className="text-gray-300 group-hover:text-gray-100 transition-colors">30s Hero Cut (16:9)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="rounded bg-gray-900 border-gray-700 text-indigo-500 focus:ring-indigo-500/50" />
                        <span className="text-gray-300 group-hover:text-gray-100 transition-colors">15s IG Reel (9:16)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'AI Assistant' && (
              <div className="h-full bg-gray-800/40 border border-gray-700/50 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Project-Aware AI Assistant</h3>
                <p className="text-gray-400 max-w-md mb-6">Chat with an AI that knows all the context of this project, including budget, shot lists, and briefs.</p>
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">Start Conversation</button>
              </div>
            )}

            {/* Other tabs can have placeholder states for now */}
            {['Shot List', 'Script', 'Storyboard', 'Tasks', 'Files'].includes(activeTab) && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium">{activeTab} section coming soon</p>
                  <p className="text-sm mt-1">This module is under development.</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
