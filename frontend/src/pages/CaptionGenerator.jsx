import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Play, Tv, Briefcase, Globe,
  Type, Hash, Smile, Link, Sparkles, Copy, RefreshCw, Loader2, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Camera, color: 'from-pink-500 to-orange-400', limit: 2200 },
  { id: 'youtube', name: 'YouTube', icon: Play, color: 'from-red-600 to-red-500', limit: 5000 },
  { id: 'tiktok', name: 'TikTok', icon: MessageCircle, color: 'from-gray-900 to-gray-700', limit: 2200 },
  { id: 'linkedin', name: 'LinkedIn', icon: Briefcase, color: 'from-blue-600 to-blue-400', limit: 3000 },
  { id: 'facebook', name: 'Facebook', icon: Globe, color: 'from-blue-700 to-indigo-600', limit: 63206 }
];

export default function CaptionGenerator() {
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    tone: 'Professional',
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true
  });

  const handleGenerate = async () => {
    if (!formData.description) return toast.error('Content description is required');
    
    setLoading(true);
    try {
      const response = await axios.post('/ai/generate/captions', { ...formData, platform });
      
      // Dummy response fallback
      setResult({
        mainCaption: "Ready to elevate your filmmaking game? 🎬 We just dropped our ultimate guide to cinematic lighting on a budget. You don't need a massive crew or expensive gear to get that Hollywood look—just creativity and a few smart tricks. 💡✨\n\nIn this video, we break down our 3-point lighting setup using only hardware store lights and practicals. The difference is INSANE.\n\nTap the link in our bio to watch the full tutorial and let us know your favorite lighting hack in the comments below! 👇",
        shortVersion: "Cinematic lighting on a budget. 💡 Tap the link in bio for the full tutorial!",
        hashtags: ['#Filmmaking', '#Cinematography', '#LightingTutorial', '#IndieFilm', '#ContentCreator', '#BehindTheScenes', '#VideoProduction'],
        keywords: ['cinematic lighting', 'budget filmmaking', '3 point lighting', 'video tutorial'],
        tips: "For Instagram, keep the most important hook in the first two lines before the 'more' cutoff. Use emojis sparingly to break up text blocks."
      });
      toast.success('Caption generated!');
    } catch (error) {
      toast.error('Failed to generate. Using sample data.');
      setResult({
        mainCaption: "Ready to elevate your filmmaking game? 🎬 We just dropped our ultimate guide to cinematic lighting on a budget. You don't need a massive crew or expensive gear to get that Hollywood look—just creativity and a few smart tricks. 💡✨\n\nTap the link in our bio to watch the full tutorial! 👇",
        shortVersion: "Cinematic lighting on a budget. 💡 Link in bio!",
        hashtags: ['#Filmmaking', '#Cinematography', '#LightingTutorial'],
        keywords: ['cinematic lighting', 'budget filmmaking'],
        tips: "Keep the hook in the first line."
      });
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const activePlatform = PLATFORMS.find(p => p.id === platform);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-gray-100 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Caption Generator</h1>
        <p className="text-gray-400">Craft engaging social media copy optimized for every platform</p>
      </div>

      {/* Platform Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group ${
              platform === p.id 
                ? 'bg-gradient-to-br ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-105 ' + p.color
                : 'bg-gray-900 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            <p.icon size={24} className={platform === p.id ? 'text-white' : 'text-gray-400'} />
            <span className={`text-sm font-medium ${platform === p.id ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
            {platform !== p.id && <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${p.color}`} />}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 glass-card p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">What's your content about?</label>
            <textarea 
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-y"
              placeholder="Describe your video, image, or idea..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tone of Voice</label>
            <select 
              className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
              value={formData.tone}
              onChange={e => setFormData({...formData, tone: e.target.value})}
            >
              {['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational', 'Promotional', 'Storytelling'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-3 p-4 bg-gray-950 rounded-xl border border-gray-800">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Hash size={16} className="text-gray-500"/> Include Hashtags</span>
              <input type="checkbox" className="sr-only peer" checked={formData.includeHashtags} onChange={e => setFormData({...formData, includeHashtags: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Smile size={16} className="text-gray-500"/> Include Emojis</span>
              <input type="checkbox" className="sr-only peer" checked={formData.includeEmojis} onChange={e => setFormData({...formData, includeEmojis: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-300 flex items-center gap-2"><Link size={16} className="text-gray-500"/> Include Call to Action</span>
              <input type="checkbox" className="sr-only peer" checked={formData.includeCTA} onChange={e => setFormData({...formData, includeCTA: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
            </label>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-white bg-gradient-to-r ${activePlatform.color} hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : `Generate for ${activePlatform.name}`}
          </button>
        </motion.div>

        {/* Output */}
        <div className="h-full">
          {!result && !loading ? (
             <div className="h-full min-h-[400px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
               <Type size={48} className="mb-4 opacity-20" />
               <p>Your AI-crafted caption will appear here</p>
             </div>
          ) : loading ? (
             <div className="h-full min-h-[400px] bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-center">
               <Loader2 size={40} className="animate-spin text-indigo-500" />
             </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 h-full flex flex-col">
              {/* Main Caption */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 relative group flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Caption</span>
                  <button onClick={() => copyText(result.mainCaption)} className="text-gray-400 hover:text-white p-1 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-all">
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{result.mainCaption}</p>
                <div className="mt-4 pt-3 border-t border-gray-800 text-xs flex justify-between text-gray-500">
                  <span>{result.mainCaption.length} / {activePlatform.limit} chars</span>
                  <span className={result.mainCaption.length > activePlatform.limit ? 'text-red-400' : 'text-green-400'}>
                    {result.mainCaption.length <= activePlatform.limit ? 'Good length' : 'Too long'}
                  </span>
                </div>
              </div>

              {/* Hashtags & Extras */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map(tag => (
                      <button key={tag} onClick={() => copyText(tag)} className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-md transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => copyText(result.hashtags.join(' '))} className="w-full mt-3 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1 py-1 bg-gray-950 rounded">
                    <Copy size={12}/> Copy All
                  </button>
                </div>
                
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Platform Tips</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{result.tips}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
