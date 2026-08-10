import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Users, FileText, Download, Copy, Printer, Table, Settings, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

export default function ShotListGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    script: '',
    camera: '',
    lenses: '',
    location: '',
    crewSize: 3,
    notes: ''
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.script) return toast.error('Script description is required');
    
    setLoading(true);
    try {
      // Map frontend field names → backend schema
      const payload = {
        script_or_description: formData.script,
        camera:                formData.camera || 'Any camera',
        lens:                  formData.lenses || 'Standard zoom',
        location:              formData.location || 'TBD',
        crew_size:             parseInt(formData.crewSize) || 3,
        additional_notes:      formData.notes || null,
      };
      const response = await axios.post('/ai/generate/shot-list', payload);
      const data = response.data;

      // Map backend field names → frontend display format
      const shots = (data.shots || []).map((s, i) => ({
        id:       s.shot_number || i + 1,
        type:     s.shot_type   || s.type   || '—',
        angle:    s.angle       || '—',
        movement: s.movement    || '—',
        lens:     s.lens        || '—',
        lighting: s.lighting    || '—',
        audio:    s.audio       || '—',
        notes:    s.notes       || '—',
        duration: s.estimated_duration || s.duration || '—',
        priority: s.priority    || 'Medium',
      }));

      setResult({
        shots,
        equipmentNeeded: data.equipment_needed || [],
        summary: {
          totalShots:    shots.length,
          estimatedTime: data.estimated_total_duration || `${shots.length * 5}s`,
        },
        productionNotes: data.production_notes || '',
      });
      toast.success(`Shot list generated! ${shots.length} shots ready.`);
    } catch (error) {
      console.error('Shot list error:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.detail || 'Failed to generate shot list.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    const headers = ['#', 'Type', 'Angle', 'Movement', 'Lens', 'Lighting', 'Audio', 'Notes', 'Duration', 'Priority'];
    const rows = result.shots.map(s => [s.id, s.type, s.angle, s.movement, s.lens, s.lighting, s.audio, s.notes, s.duration, s.priority]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shot_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-100 min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Shot List Generator</h1>
        <p className="text-gray-400 mt-2">Convert your script into a technical shooting plan</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-1 space-y-6 glass-card p-6 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><FileText size={16}/> Script / Scene Description</label>
              <textarea 
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                placeholder="Paste your scene or describe the action in detail..."
                value={formData.script}
                onChange={e => setFormData({...formData, script: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Camera size={16}/> Camera</label>
                <input 
                  type="text"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sony FX6"
                  value={formData.camera}
                  onChange={e => setFormData({...formData, camera: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Settings size={16}/> Lenses</label>
                <input 
                  type="text"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 24-70mm"
                  value={formData.lenses}
                  onChange={e => setFormData({...formData, lenses: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><MapPin size={16}/> Location</label>
                <input 
                  type="text"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Interior/Exterior..."
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Users size={16}/> Crew Size</label>
                <input 
                  type="number" min="1"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.crewSize}
                  onChange={e => setFormData({...formData, crewSize: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Table size={18} />}
              {loading ? 'Generating Shot List...' : 'Generate Shot List'}
            </button>
          </form>
        </motion.div>

        {/* Right Content */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-2 space-y-6">
          {!result && !loading ? (
             <div className="h-full min-h-[400px] glass-card bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-12 text-center">
               <Table size={64} className="mb-4 opacity-20" />
               <h3 className="text-xl font-medium mb-2">Ready to Plan</h3>
               <p className="max-w-md">Provide your script and camera details to generate a structured shot list for your production.</p>
             </div>
          ) : loading ? (
             <div className="glass-card bg-gray-900/50 border border-gray-800 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-500" />
             </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex justify-between items-center bg-gray-900/80 p-4 rounded-xl border border-gray-800">
                <div className="flex gap-4 text-sm">
                  <div className="px-3 py-1 bg-gray-800 rounded-lg"><span className="text-gray-400">Total Shots:</span> {result.summary.totalShots}</div>
                  <div className="px-3 py-1 bg-gray-800 rounded-lg"><span className="text-gray-400">Est. Screen Time:</span> {result.summary.estimatedTime}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                    <Download size={14} /> CSV
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm">
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-x-auto print:bg-white print:text-black">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-950/80 border-b border-gray-800 print:bg-gray-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Shot / Angle</th>
                      <th className="px-4 py-3">Movement / Lens</th>
                      <th className="px-4 py-3 hidden md:table-cell">Lighting / Audio</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.shots.map((shot, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-500">{shot.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-200">{shot.type}</div>
                          <div className="text-xs text-gray-400">{shot.angle}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-300">{shot.movement}</div>
                          <div className="text-xs text-blue-400">{shot.lens}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="text-gray-300">{shot.lighting}</div>
                          <div className="text-xs text-gray-500">{shot.audio}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 max-w-xs truncate" title={shot.notes}>
                          {shot.notes}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs border rounded-full ${getPriorityColor(shot.priority)}`}>
                            {shot.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Equipment List */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Settings size={18}/> Recommended Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {result.equipmentNeeded.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
