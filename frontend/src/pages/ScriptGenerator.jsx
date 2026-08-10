import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Users, Video, Globe, Type, MessageSquare, Download, Copy, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Clean markdown renderer ───────────────────────────────────────────────────
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-6 mb-3 first:mt-0 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-indigo-300 mt-5 mb-2.5 first:mt-0 pb-1.5 border-b border-gray-700 leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-purple-300 mt-4 mb-2 first:mt-0 uppercase tracking-wider">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-200 leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-2 pl-5 list-decimal text-gray-200 text-sm">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-gray-200 leading-relaxed flex items-start gap-2.5">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-gray-900 text-indigo-300 text-xs font-mono border border-gray-700">
        {children}
      </code>
    ) : (
      <code className="text-gray-300 text-xs font-mono">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="my-3 p-4 rounded-xl bg-gray-900/80 border border-gray-700 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-2 border-indigo-500 text-gray-300 italic text-sm bg-indigo-950/20 py-2 pr-3 rounded-r-lg">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-gray-800" />,
};

// Clean helper to convert raw JSON strings into formatted Markdown
const cleanContent = (val) => {
  if (!val) return '';
  if (typeof val !== 'string') {
    try {
      val = JSON.stringify(val, null, 2);
    } catch (e) {
      val = String(val);
    }
  }

  const trimmed = val.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const parts = [];
      for (const [k, v] of Object.entries(parsed)) {
        const title = k.replace(/_/g, ' ').toUpperCase();
        let contentStr = '';
        if (Array.isArray(v)) {
          contentStr = v.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join('\n- ');
          contentStr = '- ' + contentStr;
        } else if (typeof v === 'object' && v !== null) {
          contentStr = Object.entries(v).map(([subK, subV]) => `**${subK}**: ${typeof subV === 'object' ? JSON.stringify(subV) : subV}`).join('\n\n');
        } else {
          contentStr = String(v);
        }
        parts.append ? parts.push(`### 🎬 ${title}\n\n${contentStr}`) : parts.push(`### 🎬 ${title}\n\n${contentStr}`);
      }
      return parts.join('\n\n---\n\n');
    } catch (e) {
      // Return trimmed as is if parse fails
    }
  }
  return val;
};

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
      const durationMap = {
        '30 seconds': 0.5, '1 minute': 1, '2 minutes': 2,
        '3 minutes': 3, '5 minutes': 5, '10 minutes': 10,
        '15 minutes': 15, '30 minutes': 30
      };
      const payload = {
        topic: formData.topic,
        duration_minutes: durationMap[formData.duration] || 1,
        audience: formData.targetAudience || 'General',
        style: formData.style,
        platform: formData.platform,
        additional_context: formData.additionalContext || null,
      };

      const response = await axios.post('/ai/generate/script', payload);
      const data = response.data;

      const hook = cleanContent(data.hook);
      const story = cleanContent(data.story);
      const dialogue = cleanContent(data.dialogue);
      const ending = cleanContent(data.ending);
      const cta = cleanContent(data.call_to_action || data.cta);

      // Build fallback full_script if missing
      let full_script = cleanContent(data.full_script);
      if (!full_script || full_script.length < 20) {
        const sections = [
          hook ? `### 🎬 HOOK\n\n${hook}` : '',
          story ? `### 📖 STORY & SCENE FLOW\n\n${story}` : '',
          dialogue ? `### 💬 DIALOGUE & NARRATION\n\n${dialogue}` : '',
          ending ? `### 🏁 ENDING\n\n${ending}` : '',
          cta ? `### 📢 CALL TO ACTION\n\n${cta}` : '',
        ].filter(Boolean);
        full_script = sections.join('\n\n---\n\n');
      }

      const wordCount = data.word_count || (full_script ? full_script.split(/\s+/).length : 0);

      setResult({
        hook,
        story,
        dialogue,
        ending,
        cta,
        full_script,
        notes: cleanContent(data.production_notes || data.notes),
        wordCount,
        estimatedDuration: data.estimated_duration || data.estimatedDuration || formData.duration,
      });

      toast.success('Script generated successfully!');
    } catch (error) {
      console.error('Script generation error:', error?.response?.data || error.message);
      toast.error(error?.response?.data?.detail || 'Failed to generate script.');
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

  const getActiveTabContent = () => {
    if (!result) return '';
    if (activeTab === 'full') return result.full_script;
    return result[activeTab] || 'No content for this section.';
  };

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
              <div className="p-6 overflow-y-auto flex-1 max-h-[500px] text-gray-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {getActiveTabContent()}
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
