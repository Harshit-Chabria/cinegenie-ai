import React from 'react';
import { motion } from 'framer-motion';
import { Film, Users, MessageSquare, BookOpen, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <div className="text-gray-100 min-h-[calc(100vh-4rem)] bg-gray-900">
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="max-w-6xl mx-auto px-6 md:px-8 relative -mt-20">
        <div className="flex flex-col md:flex-row gap-6 md:items-end">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gray-800 border-4 border-gray-900 shadow-2xl overflow-hidden relative group">
            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
              JD
            </div>
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-sm font-medium">Edit Avatar</span>
            </div>
          </div>
          
          <div className="flex-1 pb-4">
            <h1 className="text-3xl font-bold">John Doe</h1>
            <p className="text-gray-400 text-lg">@johndoe • Independent Filmmaker</p>
          </div>
          
          <div className="pb-4">
            <Link to="/settings" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-colors font-medium">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pb-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Passionate cinematographer and director focusing on commercial and documentary work. Always pushing the boundaries of visual storytelling.
              </p>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-500"/> Los Angeles, CA</div>
                <div className="flex items-center gap-3"><LinkIcon size={16} className="text-gray-500"/> johndoe.com</div>
                <div className="flex items-center gap-3"><Calendar size={16} className="text-gray-500"/> Joined Oct 2023</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Projects', value: 12, icon: <Film size={20} className="text-indigo-400"/> },
                { label: 'Clients', value: 8, icon: <Users size={20} className="text-purple-400"/> },
                { label: 'AI Chats', value: 142, icon: <MessageSquare size={20} className="text-blue-400"/> },
                { label: 'Docs', value: 24, icon: <BookOpen size={20} className="text-amber-400"/> }
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="mb-2 p-2 bg-gray-900/50 rounded-lg">{stat.icon}</div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                Recent Projects
                <Link to="/projects" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
              </h3>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700/30 transition-colors cursor-pointer border border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center"><Film size={20} className="text-gray-400"/></div>
                      <div>
                        <h4 className="font-medium text-gray-200">Nike Summer Campaign</h4>
                        <p className="text-xs text-gray-500 mt-1">Updated 2 days ago</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">Pre-production</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
