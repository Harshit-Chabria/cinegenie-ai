import React, { useState } from 'react';
import { User, Palette, Cpu, Key, Bell, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');

  const tabs = [
    { name: 'Profile', icon: <User size={18} /> },
    { name: 'Appearance', icon: <Palette size={18} /> },
    { name: 'AI Preferences', icon: <Cpu size={18} /> },
    { name: 'API Keys', icon: <Key size={18} /> },
    { name: 'Notifications', icon: <Bell size={18} /> },
    { name: 'Danger Zone', icon: <AlertTriangle size={18} /> }
  ];

  const handleSave = () => toast.success('Settings saved successfully');

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto text-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.name ? 'bg-indigo-600/10 text-indigo-400 shadow-sm border border-indigo-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 md:p-8 min-h-[500px]">
            <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-700/50">{activeTab}</h2>
            
            {activeTab === 'Profile' && (
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">JD</div>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">Change Avatar</button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Username (Read-only)</label>
                  <input type="text" readOnly defaultValue="johndoe123" className="w-full bg-gray-900/80 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                </div>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Profile</button>
              </div>
            )}

            {activeTab === 'AI Preferences' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Default AI Role</label>
                  <select className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500">
                    <option>Director</option>
                    <option>Cinematographer</option>
                    <option>Editor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Default Model</label>
                  <select className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500">
                    <option>GPT-4o (Recommended)</option>
                    <option>GPT-3.5-Turbo</option>
                  </select>
                </div>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">Save Preferences</button>
              </div>
            )}

            {activeTab === 'Danger Zone' && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                <button onClick={() => window.confirm('Are you absolutely sure?')} className="px-6 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all font-medium">
                  Delete Account
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
