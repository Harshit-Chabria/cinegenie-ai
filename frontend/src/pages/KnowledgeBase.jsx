import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Upload, FileText, File as FileIcon, Trash2, Send, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('All');
  const [query, setQuery] = useState('');
  
  const documents = [
    { id: 1, title: 'Sony FX3 Manual', category: 'Camera Manual', type: 'pdf', size: '2.4 MB', date: '2023-10-01', status: 'ready', chunks: 145 },
    { id: 2, title: 'Nike Q3 Brief', category: 'Client Brief', type: 'docx', size: '120 KB', date: '2023-10-05', status: 'ready', chunks: 12 },
    { id: 3, title: 'Color Grading Guide', category: 'Editing Guide', type: 'txt', size: '45 KB', date: '2023-10-08', status: 'processing', chunks: 0 }
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileIcon className="text-red-400" size={32} />;
      case 'docx': return <FileText className="text-blue-400" size={32} />;
      default: return <FileText className="text-gray-400" size={32} />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-gray-100 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Knowledge Base</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2"><BookOpen size={16} /> {documents.length} Documents available for RAG</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
          <Upload size={20} /> Upload Document
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search documents..." className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Camera Manual', 'Client Brief', 'Editing Guide', 'General'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <motion.div key={doc.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800/60 transition-all group relative">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-900/50 rounded-xl shadow-inner">{getIcon(doc.type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-100 truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-700/50 text-gray-300">{doc.category}</span>
                    {doc.status === 'processing' ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 flex items-center gap-1"><div className="w-2 h-2 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div> Processing</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400">Ready</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{doc.size}</span>
                <span>{doc.date}</span>
                <span>{doc.chunks} chunks</span>
              </div>
              <button className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RAG Query Area */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-800/50 to-indigo-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Cpu className="text-indigo-400" size={18} />
          <h3 className="text-sm font-semibold text-indigo-300">Ask your Knowledge Base</h3>
        </div>
        <div className="relative">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What are the best export settings for Instagram Reels according to our guides?"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-4 pr-14 py-3 text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-24"
          />
          <button className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}
