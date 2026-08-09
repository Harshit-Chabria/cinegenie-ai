import { create } from 'zustand';

const useStore = create((set, get) => ({
  // UI state
  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Projects
  projects: [],
  setProjects: (projects) => set({ projects }),
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  // Clients
  clients: [],
  setClients: (clients) => set({ clients }),

  // AI Assistant
  currentConversation: null,
  setCurrentConversation: (conv) => set({ currentConversation: conv }),
  conversations: [],
  setConversations: (convs) => set({ conversations: convs }),
  aiMode: 'director',
  setAiMode: (mode) => set({ aiMode: mode }),
  isStreaming: false,
  setIsStreaming: (val) => set({ isStreaming: val }),

  // Notifications
  notifications: [],
  setNotifications: (notifs) => set({ notifications: notifs }),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

export default useStore;
