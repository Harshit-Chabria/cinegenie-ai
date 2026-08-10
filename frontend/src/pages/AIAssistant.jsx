import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, Search, Trash2, Send, Paperclip,
  Film, Camera, Scissors, ClipboardList, Smartphone, Palette, Users, User, Bot, Copy, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const AI_MODES = [
  { id: 'director', name: 'Director', icon: Film, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/50', desc: 'Creative vision & pacing' },
  { id: 'cinematographer', name: 'Cinematographer', icon: Camera, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/50', desc: 'Lighting & composition' },
  { id: 'editor', name: 'Editor', icon: Scissors, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/50', desc: 'Flow & transitions' },
  { id: 'producer', name: 'Producer', icon: ClipboardList, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/50', desc: 'Logistics & budget' },
  { id: 'social', name: 'Social Media', icon: Smartphone, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/50', desc: 'Trends & engagement' },
  { id: 'colorist', name: 'Colorist', icon: Palette, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/50', desc: 'Grading & mood' },
  { id: 'client', name: 'Client Manager', icon: Users, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/50', desc: 'Pitching & feedback' },
];

// ── Clean markdown renderer ───────────────────────────────────────────────────
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-white mt-6 mb-3 first:mt-0 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-indigo-300 mt-5 mb-2.5 first:mt-0 pb-1.5 border-b border-gray-700 leading-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-purple-300 mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-200 leading-7 mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 space-y-2 pl-5 list-decimal">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-gray-200 leading-relaxed flex items-start gap-2.5">
      <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
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
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-900/80">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-300 uppercase tracking-wider border-b border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800/60 last:border-b-0">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-gray-800/30 transition-colors">{children}</tr>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-2 border-indigo-500 text-gray-400 italic text-sm">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-gray-700" />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">
      {children}
    </a>
  ),
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [aiMode, setAiMode] = useState('director');
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isStreaming) sendMessage();
    }
  };

  const sendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setInputValue('');
    setIsStreaming(true);

    const newUserMsg = { role: 'user', content: userMessage, id: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);

    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', id: aiMsgId, streaming: true }]);

    try {
      const token = localStorage.getItem('cinegenie_token') || '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/ai/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ message: userMessage, conversation_id: currentConversationId, ai_mode: aiMode })
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              fullContent += data.content;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullContent } : m));
            } else if (data.type === 'conversation_id') {
              setCurrentConversationId(data.conversation_id);
            } else if (data.type === 'done') {
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m));
            } else if (data.type === 'error') {
              const errMsg = data.message || 'An error occurred.';
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: `⚠️ **Error:** ${errMsg}`, streaming: false, isError: true } : m
              ));
            }
          } catch (e) {}
        }
      }
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, streaming: false } : m));
    } catch (e) {
      toast.error('Failed to send message');
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, content: 'Sorry, I encountered an error. Please try again.', streaming: false } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const activeMode = AI_MODES.find(m => m.id === aiMode);
  const ModeIcon = activeMode?.icon || Bot;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Left Sidebar ── */}
      <div className="w-72 border-r border-gray-800 bg-gray-900/50 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} /> New Chat
          </button>
        </div>

        {/* AI Modes */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Persona</h3>
          <div className="grid grid-cols-4 gap-2">
            {AI_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setAiMode(mode.id)}
                title={mode.name}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  aiMode === mode.id
                    ? `${mode.bg} ${mode.border} border`
                    : 'hover:bg-gray-800 border border-transparent'
                }`}
              >
                <mode.icon size={20} className={aiMode === mode.id ? mode.color : 'text-gray-400'} />
              </button>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-400 text-center">
            {activeMode?.name} — {activeMode?.desc}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                <MessageSquare size={16} className="text-gray-500" />
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-gray-500">{conv.ai_mode}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Chat Panel ── */}
      <div className="flex-1 flex flex-col bg-gray-950 relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${activeMode?.bg} ${activeMode?.color}`}>
              <ModeIcon size={20} />
            </div>
            <div>
              <h2 className="font-semibold">{activeMode?.name} AI</h2>
              <p className="text-xs text-gray-400">Powered by Llama 3.2 · local</p>
            </div>
          </div>
          <button onClick={handleNewChat} className="text-sm text-gray-400 hover:text-white transition-colors">
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ModeIcon size={64} className={`mb-6 ${activeMode?.color}`} />
              <h3 className="text-2xl font-bold mb-2">How can I help with your project?</h3>
              <p className="max-w-md text-gray-400">Ask for script feedback, shot list ideas, budget estimates, or creative direction.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === 'user' ? (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${activeMode?.bg} ${activeMode?.color} border ${activeMode?.border}`}>
                      <ModeIcon size={18} />
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[82%]`}>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{msg.role === 'user' ? 'You' : `${activeMode?.name} AI`}</span>
                    <span>·</span>
                    <span>Just now</span>
                  </div>

                  <div className={`rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm px-4 py-3'
                      : 'bg-gray-900 border border-gray-700/60 rounded-tl-sm px-5 py-4'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                          {msg.content || ''}
                        </ReactMarkdown>
                        {msg.streaming && (
                          <span className="inline-flex gap-1 mt-2">
                            <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}    className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}   className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}   className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {/* Copy button for AI messages */}
                  {msg.role === 'assistant' && !msg.streaming && msg.content && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copied!'); }}
                      className="text-gray-600 hover:text-gray-300 flex items-center gap-1 text-xs transition-colors px-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-gray-900 border border-gray-700 rounded-xl p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <button className="p-2 text-gray-500 cursor-not-allowed" disabled title="Attachments coming soon">
              <Paperclip size={20} />
            </button>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeMode?.name} AI… (Enter to send, Shift+Enter for new line)`}
              className="flex-1 max-h-48 min-h-[44px] bg-transparent resize-none py-2.5 px-2 focus:outline-none text-gray-100 placeholder-gray-500 text-sm leading-relaxed"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isStreaming}
              className={`p-2.5 rounded-lg flex items-center justify-center transition-colors ${
                inputValue.trim() && !isStreaming
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={18} className={isStreaming ? 'opacity-50' : ''} />
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-600 flex justify-between px-2">
            <span>{inputValue.length} characters</span>
            <span>Llama 3.2:3b running locally · no data leaves your machine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
