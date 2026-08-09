import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Play, Users, Bot, Plus, FileText, List, MessageSquare, BookOpen, ArrowRight, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import { format } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const statusColors = {
  draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  pre_production: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  production: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  post_production: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
};

const SkeletonCard = () => (
  <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 animate-pulse h-32">
    <div className="w-12 h-12 bg-slate-800 rounded-xl mb-4" />
    <div className="h-6 bg-slate-800 rounded w-1/2 mb-2" />
    <div className="h-4 bg-slate-800 rounded w-1/3" />
  </div>
);

const EmptyState = ({ icon: Icon, message, action, actionLabel }) => (
  <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed flex flex-col items-center gap-3">
    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
      <Icon className="w-6 h-6 text-slate-500" />
    </div>
    <p className="text-slate-500 text-sm">{message}</p>
    {action && (
      <Link to={action} className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
        {actionLabel} <ArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { icon: Plus,         label: 'New Project',      color: 'text-blue-400',   bg: 'bg-blue-400/10',   link: '/projects' },
    { icon: FileText,     label: 'Script Generator', color: 'text-violet-400', bg: 'bg-violet-400/10', link: '/script-generator' },
    { icon: List,         label: 'Shot List',        color: 'text-pink-400',   bg: 'bg-pink-400/10',   link: '/shot-list' },
    { icon: MessageSquare,label: 'Captions',         color: 'text-amber-400',  bg: 'bg-amber-400/10',  link: '/captions' },
    { icon: Users,        label: 'New Client',       color: 'text-emerald-400',bg: 'bg-emerald-400/10',link: '/clients' },
    { icon: BookOpen,     label: 'Knowledge Base',   color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   link: '/knowledge-base' },
  ];

  // Real stat values — default 0, no fake fallbacks
  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.stats?.total_projects ?? 0,
      icon: FolderOpen,
      color: 'blue',
    },
    {
      label: 'Active Projects',
      value: stats?.stats?.active_projects ?? 0,
      icon: Play,
      color: 'green',
    },
    {
      label: 'Total Clients',
      value: stats?.stats?.total_clients ?? 0,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'AI Conversations',
      value: stats?.stats?.total_conversations ?? 0,
      icon: Bot,
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 lg:p-10 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {greeting}, {user?.username || 'Creator'}! ✨
            </h1>
            <p className="text-slate-400">
              {format(new Date(), 'EEEE, MMMM do, yyyy')} · Let's make some movie magic today.
            </p>
          </div>
          <Link
            to="/ai-assistant"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Open AI Assistant
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            statCards.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl p-6 relative overflow-hidden group cursor-default"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 rounded-bl-full blur-2xl group-hover:bg-${stat.color}-500/20 transition-colors`} />
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-400 flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => (
              <Link key={idx} to={action.link}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-900/50 border border-slate-800 hover:border-slate-600 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-center transition-colors group h-full"
                >
                  <div className={`w-10 h-10 rounded-full ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 animate-pulse h-20" />
                ))
              ) : stats?.recent_projects?.length > 0 ? (
                stats.recent_projects.map((project) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
                      <div>
                        <h3 className="text-base font-semibold text-white mb-0.5 group-hover:text-violet-300 transition-colors">{project.name}</h3>
                        <p className="text-sm text-slate-400">
                          {project.shoot_type || 'General'} ·{' '}
                          {project.created_at ? format(new Date(project.created_at), 'MMM d, yyyy') : '—'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[project.status] || statusColors.draft}`}>
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  message="No projects yet. Create your first one!"
                  action="/projects"
                  actionLabel="Create Project"
                />
              )}
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Upcoming Events */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Upcoming Shoots</h2>
                <Link to="/calendar" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Calendar <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {Array(2).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-800 rounded-lg" />)}
                  </div>
                ) : stats?.upcoming_events?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcoming_events.map((event, idx) => (
                      <div key={idx} className="flex gap-4 items-start pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                        <div className="bg-slate-800/80 rounded-lg p-2 text-center min-w-[3rem]">
                          <div className="text-xs text-violet-400 font-medium">
                            {format(new Date(event.start_time), 'MMM').toUpperCase()}
                          </div>
                          <div className="text-lg font-bold text-white">
                            {format(new Date(event.start_time), 'd')}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-slate-200 font-medium text-sm mb-1">{event.title}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.start_time), 'h:mm a')}
                            {event.location && ` · ${event.location}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Clock}
                    message="No upcoming events"
                    action="/calendar"
                    actionLabel="Add Event"
                  />
                )}
              </div>
            </div>

            {/* Recent AI Conversations */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Recent AI Chats</h2>
                <Link to="/ai-assistant" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Open AI <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {Array(2).fill(0).map((_, i) => <div key={i} className="h-10 bg-slate-800 rounded-lg" />)}
                  </div>
                ) : stats?.recent_conversations?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recent_conversations.map((conv, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate('/ai-assistant')}
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 p-2 rounded-lg transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-slate-300 text-sm font-medium truncate">{conv.title}</h4>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500">{conv.ai_mode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Bot}
                    message="No AI conversations yet"
                    action="/ai-assistant"
                    actionLabel="Start a Chat"
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
