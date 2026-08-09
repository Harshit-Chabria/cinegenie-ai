import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FolderOpen, Bot, FileText, List, 
  Film, MessageSquare, Users, Calendar, BookOpen, 
  Sparkles, Settings, User, ChevronLeft, ChevronRight 
} from 'lucide-react';
import useStore from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

const navSections = [
  {
    title: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: FolderOpen, label: 'Projects', path: '/projects' },
      { icon: Bot, label: 'AI Assistant', path: '/ai-assistant' },
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { icon: FileText, label: 'Script Generator', path: '/script-generator' },
      { icon: List, label: 'Shot List', path: '/shot-list' },
      { icon: Film, label: 'Storyboard', path: '/storyboard' },
      { icon: MessageSquare, label: 'Captions', path: '/captions' },
    ]
  },
  {
    title: 'MANAGE',
    items: [
      { icon: Users, label: 'Clients', path: '/clients' },
      { icon: Calendar, label: 'Calendar', path: '/calendar' },
      { icon: BookOpen, label: 'Knowledge Base', path: '/knowledge-base' },
      { icon: Sparkles, label: 'Prompts', path: '/prompts' },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: User, label: 'Profile', path: '/profile' },
    ]
  }
];

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useStore();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      className="fixed top-0 left-0 h-screen bg-[#0d0d1a] border-r border-white/5 flex flex-col z-40 transition-all duration-300"
    >
      <div className="p-4 flex items-center justify-between h-16 border-b border-white/5">
        <div className="flex items-center overflow-hidden whitespace-nowrap">
          <span className="text-2xl mr-2">🎬</span>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center font-bold text-lg"
            >
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                CineGenie
              </span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-primary-500/20 text-primary-400 uppercase">
                AI
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!sidebarCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                               (location.pathname.startsWith(item.path + '/'));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors relative group ${
                      isActive 
                        ? 'bg-primary-500/10 text-primary-400' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-5 bg-primary-500 rounded-r-full"
                      />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-[#0d0d1a]">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 mb-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="flex items-center bg-[#1a1a2e] p-2 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user?.name || 'User')}
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'guest@cinegenie.ai'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
