import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Mail, Phone, MoreVertical, Edit2, Trash2, ExternalLink, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '', website: '', status: 'Active', notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // const res = await axios.get(`${API_URL}/clients`);
      // Mock data for UI presentation
      const mockClients = [
        { _id: '1', name: 'Acme Corp', company: 'Acme', email: 'contact@acme.com', phone: '123-456-7890', status: 'Active', projectCount: 3 },
        { _id: '2', name: 'Jane Doe', company: 'Freelance', email: 'jane@example.com', phone: '098-765-4321', status: 'Prospect', projectCount: 0 }
      ];
      setClients(mockClients);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        // await axios.put(`${API_URL}/clients/${editingClient._id}`, formData);
        toast.success('Client updated');
      } else {
        // await axios.post(`${API_URL}/clients`, formData);
        toast.success('Client added');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error) {
      toast.error('Failed to save client');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Clients</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2"><Users size={16} /> Manage your contacts and prospects ({clients.length})</p>
        </div>
        <button onClick={() => { setEditingClient(null); setFormData({name: '', email: '', phone: '', company: '', address: '', website: '', status: 'Active', notes: ''}); setIsModalOpen(true); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add Client
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Active', 'Inactive', 'Prospect'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredClients.map(client => (
            <motion.div key={client._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/60 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => { setEditingClient(client); setFormData(client); setIsModalOpen(true); }} className="p-2 bg-gray-700/50 hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-400 rounded-lg transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => { if(window.confirm('Delete?')) { toast.success('Deleted'); fetchClients(); } }} className="p-2 bg-gray-700/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg text-white">
                  {getInitials(client.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">{client.name}</h3>
                  <p className="text-gray-400 text-sm">{client.company}</p>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                {client.email && <div className="flex items-center gap-3 text-sm text-gray-300"><Mail size={16} className="text-gray-500" /> {client.email}</div>}
                {client.phone && <div className="flex items-center gap-3 text-sm text-gray-300"><Phone size={16} className="text-gray-500" /> {client.phone}</div>}
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-700/50">
                <span className={`px-2 py-1 rounded text-xs font-medium ${client.status === 'Active' ? 'bg-green-500/10 text-green-400' : client.status === 'Prospect' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                  {client.status}
                </span>
                <span className="text-sm text-gray-400">{client.projectCount} Projects</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">{editingClient ? 'Save Changes' : 'Add Client'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
