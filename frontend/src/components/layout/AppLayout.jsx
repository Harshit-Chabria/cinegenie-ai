import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useStore from '../../store/useStore';

const routeTitles = {
  '/dashboard':        'Dashboard',
  '/projects':         'Projects',
  '/ai-assistant':     'AI Assistant',
  '/script-generator': 'Script Generator',
  '/shot-list':        'Shot List',
  '/storyboard':       'Storyboard',
  '/captions':         'Captions',
  '/clients':          'Clients',
  '/calendar':         'Calendar',
  '/knowledge-base':   'Knowledge Base',
  '/prompts':          'Prompt Library',
  '/settings':         'Settings',
  '/profile':          'Profile',
};

const AppLayout = () => {
  const { sidebarCollapsed } = useStore();
  const location = useLocation();
  
  const title = routeTitles[location.pathname] ||
    Object.entries(routeTitles).find(([path]) =>
      location.pathname.startsWith(path + '/')
    )?.[1] || 'CineGenie AI';

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-gray-300 flex overflow-hidden">
      <Sidebar />
      
      <main 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '260px' }}
      >
        <Topbar title={title} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
