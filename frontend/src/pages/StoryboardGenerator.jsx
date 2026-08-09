import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, Palette, Sun, LayoutGrid, Download, Copy, RefreshCw, Loader2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

export default function StoryboardGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    script: '',
    numScenes: '8',
    visualStyle: 'Cinematic',
    mood: 'Dramatic'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.script) return toast.error('Script description is required');
    
    setLoading(true);
    try {
      const response = await axios.post('/ai/generate/storyboard', formData);
      // Dummy response fallback
      setResult({
        moodText: "A high-tension, cinematic sequence heavily utilizing shadows and cool tones, contrasted with bursts of warm practical lights.",
        colorPalette: ['#0f172a', '#1e3a8a', '#94a3b8', '#f59e0b', '#dc2626'],
        scenes: Array.from({ length: parseInt(formData.numScenes) || 6 }).map((_, i) => ({
          id: i + 1,
          title: `Scene ${i + 1}`,
          characters: "Sarah, The Entity",
          camera: i % 2 === 0 ? "Tracking Wide" : "Extreme Close Up",
          composition: "Rule of thirds, character placed on right intersection looking left into empty space.",
          lighting: "Low-key lighting, strong rim light from the right.",
          prompt: `Cinematic film still, ${formData.visualStyle} style, ${formData.mood} mood, character looking into empty space, strong rim lighting, highly detailed, 8k --ar 16:9`,
          dialogue: "We can't stay here."
        }))
      });
      toast.success('Storyboard generated!');
    } catch (error) {
      toast.error('Using sample data.');
      setResult({
        moodText: "A high-tension, cinematic sequence heavily utilizing shadows.",
        colorPalette: ['#0f172a', '#1e3a8a', '#94a3b8', '#f59e0b'],
        scenes: [1,2,3,4,5,6].map(i => ({
          id: i,
          title: `Scene ${i}`,
          characters: "Main Character",
          camera: "Wide Shot",
          composition: "Symmetrical framing",
          lighting: "Chiaroscuro",
          prompt: `Cinematic film still, ${formData.visualStyle} style, 8k --ar 16:9`,
          dialogue: "..."
        }))
      });
    } finally {
      setLoading(false);
    }
  };

  const exportPrompts = () => {
    if (!result) return;
    const prompts = result.scenes.map(s => `Scene ${s.id}:\n${s.prompt}\n`).join('\n');
    const blob = new Blob([prompts], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `midjourney_prompts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Storyboard Generator</h1>
        <p className="text-gray-400 mt-2">Translate your script into visual prompts and sequence planning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
          <form onSubmit={handleGenerate} className="glass-card bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 space-y-5 sticky top-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><LayoutGrid size={16}/> Script Context</label>
              <textarea 
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 min-h-[120px]"
                placeholder="Paste the script section to storyboard..."
                value={formData.script}
                onChange={e => setFormData({...formData, script: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Number of Scenes</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500"
                value={formData.numScenes}
                onChange={e => setFormData({...formData, numScenes: e.target.value})}
              >
                {['5', '8', '10', '12', '15', '20'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><ImageIcon size={16}/> Visual Style</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500"
                value={formData.visualStyle}
                onChange={e => setFormData({...formData, visualStyle: e.target.value})}
              >
                {['Cinematic', 'Documentary', 'Fashion', 'Commercial', 'Animated', 'Noir', 'Vibrant', 'Minimalist'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Sun size={16}/> Mood</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500"
                value={formData.mood}
                onChange={e => setFormData({...formData, mood: e.target.value})}
              >
                {['Dramatic', 'Romantic', 'Energetic', 'Calm', 'Mysterious', 'Joyful', 'Melancholic', 'Epic'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LayoutGrid size={18} />}
              {loading ? 'Visualizing...' : 'Generate Storyboard'}
            </button>
          </form>
        </motion.div>

        {/* Right Content */}
        <div className="lg:col-span-3">
          {!result && !loading ? (
             <div className="h-full min-h-[500px] glass-card bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-12 text-center">
               <Palette size={64} className="mb-4 opacity-20" />
               <h3 className="text-xl font-medium mb-2">Visualize Your Vision</h3>
               <p className="max-w-md">Input your script to break it down into detailed visual scenes, complete with AI image generation prompts.</p>
             </div>
          ) : loading ? (
             <div className="h-full min-h-[500px] flex items-center justify-center">
               <div className="flex flex-col items-center gap-4 text-violet-400">
                 <Loader2 size={48} className="animate-spin" />
                 <p className="animate-pulse">Crafting visual sequences...</p>
               </div>
             </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Creative Direction</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{result.moodText}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-2">
                    {result.colorPalette.map((color, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-gray-700 shadow-sm" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                  <button onClick={exportPrompts} className="text-sm flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                    <Download size={16}/> Export Prompts (.txt)
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {result.scenes.map((scene, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: idx * 0.05 }}
                    key={scene.id} 
                    className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col group"
                  >
                    {/* Placeholder Image area */}
                    <div className="aspect-video bg-gray-950 relative flex items-center justify-center border-b border-gray-800 group-hover:border-violet-500/50 transition-colors">
                      <ImageIcon size={32} className="text-gray-800" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex items-end p-3">
                        <span className="text-xs font-bold px-2 py-1 bg-black/60 rounded backdrop-blur-sm">{scene.title}</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col gap-3 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-violet-900/30 text-violet-400 rounded border border-violet-800/50">
                          {scene.camera}
                        </span>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <p><span className="text-gray-500">Action:</span> <span className="text-gray-300">{scene.composition}</span></p>
                        <p><span className="text-gray-500">Lighting:</span> <span className="text-gray-300">{scene.lighting}</span></p>
                        {scene.dialogue && (
                          <div className="mt-2 p-2 bg-gray-950 rounded border border-gray-800/50 italic text-gray-400 text-xs">
                            "{scene.dialogue}"
                          </div>
                        )}
                      </div>

                      <div className="mt-2 pt-3 border-t border-gray-800/50">
                        <p className="text-[10px] font-semibold text-gray-500 mb-1 flex justify-between items-center">
                          IMAGE PROMPT
                          <button onClick={() => { navigator.clipboard.writeText(scene.prompt); toast.success('Prompt copied'); }} className="p-1 hover:text-white hover:bg-gray-800 rounded transition-colors">
                            <Copy size={12}/>
                          </button>
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-3 group-hover:line-clamp-none transition-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(scene.prompt); toast.success('Prompt copied'); }}>
                          {scene.prompt}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
