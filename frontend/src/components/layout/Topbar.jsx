import React from 'react';
import { Bell, Search, Menu as MenuIcon } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import useStore from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const Topbar = ({ title }) => {
  const { unreadCount, toggleSidebar } = useStore();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#0d0d1a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 lg:hidden"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-[#1a1a2e] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-48 lg:w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0d0d1a]" />
          )}
        </button>

        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 hover:ring-primary-500 transition-all">
              {getInitials(user?.name || 'User')}
            </div>
          </Menu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-lg py-1 focus:outline-none overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-medium text-white">{user?.name || 'Guest User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'guest@cinegenie.ai'}</p>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/profile" className={`${active ? 'bg-white/5 text-white' : 'text-gray-300'} block px-4 py-2 text-sm transition-colors`}>
                    Your Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/settings" className={`${active ? 'bg-white/5 text-white' : 'text-gray-300'} block px-4 py-2 text-sm transition-colors`}>
                    Settings
                  </Link>
                )}
              </Menu.Item>
              <div className="h-px bg-white/5 my-1" />
              <Menu.Item>
                {({ active }) => (
                  <button onClick={logout} className={`${active ? 'bg-red-500/10 text-red-400' : 'text-red-400/80'} block w-full text-left px-4 py-2 text-sm transition-colors`}>
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Topbar;
