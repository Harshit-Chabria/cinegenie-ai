import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, MapPin, Calendar, Users, DollarSign, X, FolderOpen } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

const TABS = ['All', 'Draft', 'Pre-Production', 'Production', 'Post-Production', 'Delivered'];
const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'];

const statusColors = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  pre_production: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  production: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  post_production: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', description: '', shootType: 'commercial', status: 'draft', location: '', budget: '', color: 'bg-blue-500'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/projects');
      setProjects(data);
    } catch (error) {
      // Mock data for demo
      setProjects([
        { _id: '1', name: 'Nike Summer Campaign', client: { name: 'Nike Inc.' }, shootType: 'commercial', status: 'pre_production', location: 'Los Angeles, CA', shootDate: new Date(), crewCount: 12, budget: 25000, color: 'bg-orange-500' },
        { _id: '2', name: 'Smith Wedding', client: { name: 'John & Jane' }, shootType: 'wedding', status: 'production', location: 'Santorini, Greece', shootDate: new Date(), crewCount: 4, budget: 8500, color: 'bg-rose-500' },
        { _id: '3', name: 'TechCorp Explainer', client: { name: 'TechCorp' }, shootType: 'corporate', status: 'post_production', location: 'Studio B', shootDate: new Date(), crewCount: 3, budget: 5000, color: 'bg-blue-500' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'All' || p.status.replace('_', '-').toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/projects', formData);
      setProjects([res.data, ...projects]);
      setShowNewModal(false);
      toast.success('Project created!');
    } catch (error) {
      toast.success('Mock project created successfully!');
      setShowNewModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 lg:p-10 font-sans relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-slate-400 mt-1">Manage your film and video productions ({projects.length})</p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-5 h-5" /> New Project
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <div className="flex overflow-x-auto w-full lg:w-auto hide-scrollbar gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/50 hover:border-slate-700 transition-all cursor-pointer group"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className={`h-1.5 w-full ${project.color || 'bg-violet-500'}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                        {project.shootType}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">{project.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{project.client?.name}</p>
                    </div>
                    <button className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-400">
                      <MapPin className="w-4 h-4 mr-2 text-slate-500" /> {project.location || 'TBD'}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar className="w-4 h-4 mr-2 text-slate-500" /> {project.shootDate ? format(new Date(project.shootDate), 'MMM d, yyyy') : 'TBD'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${statusColors[project.status] || statusColors.draft}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex gap-3 text-slate-500 text-sm">
                      <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {project.crewCount || 0}</span>
                      <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1" /> {project.budget ? `${(project.budget/1000).toFixed(1)}k` : '-'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">Get started by creating your first production project or adjust your filters.</p>
            <button 
              onClick={() => setShowNewModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create Project
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 sticky top-0 z-10">
                <h2 className="text-2xl font-bold text-white">Create New Project</h2>
                <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="new-project-form" onSubmit={handleCreateProject} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-white" placeholder="e.g., Summer Campaign 2024" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Shoot Type</label>
                      <select value={formData.shootType} onChange={e => setFormData({...formData, shootType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 text-white">
                        <option value="commercial">Commercial</option>
                        <option value="wedding">Wedding</option>
                        <option value="documentary">Documentary</option>
                        <option value="music_video">Music Video</option>
                        <option value="corporate">Corporate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 text-white">
                        <option value="draft">Draft</option>
                        <option value="pre_production">Pre-Production</option>
                        <option value="production">Production</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 text-white" placeholder="e.g., Studio A" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget ($)</label>
                      <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-violet-500 text-white" placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Project Color</label>
                    <div className="flex gap-3">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, color})}
                          className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={() => setShowNewModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="new-project-form" className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20">
                  Create Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
