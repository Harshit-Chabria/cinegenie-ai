import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Users, Video, Globe, Type, MessageSquare, Download, Copy, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ScriptGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('full');
  
  const [formData, setFormData] = useState({
    topic: '',
    duration: '1 minute',
    targetAudience: '',
    style: 'Cinematic',
    platform: 'YouTube',
    additionalContext: ''
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic) return toast.error('Topic is required');
    
    setLoading(true);
    try {
      const response = await axios.post('/ai/generate/script', formData);
      // Dummy response for fallback if API isn't ready
      const dummyRes = {
        hook: '# Hook\n\n**VISUAL:** Wide drone shot sweeping over a misty forest at dawn. The camera moves fast, almost frantically.\n\n**AUDIO:** Low, pulsing synth bass. A single crow caws.\n\n**NARRATOR (V.O.):** They told us the woods were empty. They lied.',
        story: '# Story Body\n\n**VISUAL:** Cut to close up of boots crunching on dry leaves. Reveal SARAH (20s, determined, muddy face) holding a glowing artifact.\n\n**SARAH:** (Breathless) I found it. But it\'s waking up.\n\n**VISUAL:** The artifact pulses with blue light, illuminating the trees. Shadows stretch unnaturally.',
        dialogue: '# Key Dialogue\n\n**SARAH:** We don\'t have much time.\n**MIKE (RADIO):** Get out of there, Sarah! Now!\n**SARAH:** Not without answers.',
        ending: '# Ending\n\n**VISUAL:** Sarah stands before a massive, ancient stone door embedded in a cliff face. The artifact fits perfectly into a recess.\n\n**AUDIO:** A deafening grinding sound as the door cracks open. Blinding white light spills out.',
        cta: '# Call to Action\n\n**TEXT ON SCREEN:** What lies beyond? Discover the truth in the full film.\n\n**NARRATOR (V.O.):** Watch the full short film now on our channel. Subscribe for more.',
        full_script: '# Complete Script\n\n[Full script content combining the above elements...]',
        notes: '- Keep lighting moody and high-contrast.\n- Sound design is critical for tension.\n- Cast needs to show authentic exhaustion.',
        wordCount: 450,
        estimatedDuration: '1m 20s'
      };
      
      setResult(response.data.script || dummyRes);
      toast.success('Script generated successfully!');
    } catch (error) {
      toast.error('Failed to generate script. Using fallback for demonstration.');
      // Fallback for UI demonstration
      setResult({
        hook: '# Hook\n\n**VISUAL:** Wide drone shot sweeping over a misty forest at dawn.\n\n**AUDIO:** Low, pulsing synth bass.\n\n**NARRATOR (V.O.):** They told us the woods were empty. They lied.',
        story: '# Story Body\n\n**VISUAL:** Cut to close up of boots crunching on dry leaves. Reveal SARAH holding a glowing artifact.\n\n**SARAH:** (Breathless) I found it.',
        dialogue: '# Key Dialogue\n\n**SARAH:** We don\'t have much time.\n**MIKE (RADIO):** Get out of there, Sarah! Now!',
        ending: '# Ending\n\n**VISUAL:** Sarah stands before a massive, ancient stone door. The artifact fits perfectly.',
        cta: '# Call to Action\n\n**TEXT ON SCREEN:** What lies beyond? Subscribe for more.',
        full_script: '# The Whispering Woods - Full Script\n\n**VISUAL:** Wide drone shot sweeping over a misty forest at dawn.\n\n**AUDIO:** Low, pulsing synth bass.\n\n**NARRATOR (V.O.):** They told us the woods were empty. They lied.\n\n...',
        notes: '- Keep lighting moody and high-contrast.\n- Sound design is critical for tension.',
        wordCount: 450,
        estimatedDuration: '1m 20s'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result && result.full_script) {
      navigator.clipboard.writeText(result.full_script);
      toast.success('Copied to clipboard!');
    }
  };

  const exportTxt = () => {
    if (!result) return;
    const blob = new Blob([result.full_script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'full', label: 'Full Script' },
    { id: 'hook', label: 'Hook' },
    { id: 'story', label: 'Story' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'ending', label: 'Ending' },
    { id: 'cta', label: 'CTA' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Script Generator</h1>
          <p className="text-gray-400 mt-2">Transform your ideas into production-ready scripts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel - Input Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><FileText size={16}/> Topic / Concept</label>
              <textarea 
                required
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[100px]"
                placeholder="What is this video about?"
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Clock size={16}/> Duration</label>
                <select 
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                >
                  {['30 seconds', '1 minute', '2 minutes', '3 minutes', '5 minutes', '10 minutes', '15 minutes', '30 minutes'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Globe size={16}/> Platform</label>
                <select 
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={formData.platform}
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                >
                  {['YouTube', 'Instagram Reels', 'TikTok', 'LinkedIn', 'Facebook', 'Website', 'TV/Broadcast', 'Film'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Users size={16}/> Target Audience</label>
              <input 
                type="text"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Gen Z gamers, tech professionals"
                value={formData.targetAudience}
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Video size={16}/> Style</label>
              <select 
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                value={formData.style}
                onChange={e => setFormData({...formData, style: e.target.value})}
              >
                {['Documentary', 'Cinematic', 'Vlog', 'Commercial', 'Educational', 'Inspirational', 'Comedy', 'Drama', 'Testimonial'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2"><Type size={16}/> Additional Context (Optional)</label>
              <textarea 
                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[80px]"
                placeholder="Specific key phrases, branding, constraints..."
                value={formData.additionalContext}
                onChange={e => setFormData({...formData, additionalContext: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {loading ? 'Generating...' : 'Generate Script'}
            </button>
          </form>
        </motion.div>

        {/* Right Panel - Output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 flex flex-col">
          {!result && !loading ? (
             <div className="flex-1 bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-12 text-center h-[600px]">
               <FileText size={64} className="mb-4 opacity-20" />
               <h3 className="text-xl font-medium mb-2">Awaiting Instructions</h3>
               <p className="max-w-md">Fill out the form on the left and hit generate to create a professional script.</p>
             </div>
          ) : loading ? (
             <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-2xl p-8 flex flex-col space-y-6 h-[600px] overflow-hidden">
               <div className="h-8 bg-gray-800 rounded w-1/3 animate-pulse"></div>
               <div className="space-y-3">
                 <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
                 <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
                 <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse"></div>
               </div>
               <div className="h-32 bg-gray-800 rounded w-full animate-pulse mt-8"></div>
               <div className="flex justify-center mt-auto"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>
             </div>
          ) : (
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
              {/* Output Header */}
              <div className="border-b border-gray-800 p-4 flex items-center justify-between bg-gray-900">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                    <Type size={14} /> {result.wordCount || 0} words
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
                    <Clock size={14} /> Est. {result.estimatedDuration || '0m'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Copy All">
                    <Copy size={18} />
                  </button>
                  <button onClick={exportTxt} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Download .txt">
                    <Download size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800 overflow-x-auto bg-gray-950/50">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none prose-headings:text-indigo-300 prose-strong:text-purple-300 prose-p:text-gray-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeTab === 'full' ? result.full_script : result[activeTab]}
                </ReactMarkdown>
              </div>

              {/* Production Notes Footer */}
              <div className="border-t border-gray-800 p-6 bg-gray-950/80">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><MessageSquare size={16}/> Production Notes</h4>
                <div className="text-sm text-gray-400 whitespace-pre-wrap">
                  {result.notes || "No specific production notes provided."}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
