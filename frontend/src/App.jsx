import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/layout/AppLayout';

// Auth pages - eagerly loaded
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// App pages - lazy loaded for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const ScriptGenerator = lazy(() => import('./pages/ScriptGenerator'));
const ShotListGenerator = lazy(() => import('./pages/ShotListGenerator'));
const StoryboardGenerator = lazy(() => import('./pages/StoryboardGenerator'));
const CaptionGenerator = lazy(() => import('./pages/CaptionGenerator'));
const Clients = lazy(() => import('./pages/Clients'));
const Calendar = lazy(() => import('./pages/Calendar'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const PromptLibrary = lazy(() => import('./pages/PromptLibrary'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading spinner for Suspense
const PageLoader = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Public route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected routes - wrapped in AppLayout */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="projects" element={
          <Suspense fallback={<PageLoader />}>
            <Projects />
          </Suspense>
        } />
        <Route path="projects/:id" element={
          <Suspense fallback={<PageLoader />}>
            <ProjectDetail />
          </Suspense>
        } />
        <Route path="ai-assistant" element={
          <Suspense fallback={<PageLoader />}>
            <AIAssistant />
          </Suspense>
        } />
        <Route path="script-generator" element={
          <Suspense fallback={<PageLoader />}>
            <ScriptGenerator />
          </Suspense>
        } />
        <Route path="shot-list" element={
          <Suspense fallback={<PageLoader />}>
            <ShotListGenerator />
          </Suspense>
        } />
        <Route path="storyboard" element={
          <Suspense fallback={<PageLoader />}>
            <StoryboardGenerator />
          </Suspense>
        } />
        <Route path="captions" element={
          <Suspense fallback={<PageLoader />}>
            <CaptionGenerator />
          </Suspense>
        } />
        <Route path="clients" element={
          <Suspense fallback={<PageLoader />}>
            <Clients />
          </Suspense>
        } />
        <Route path="calendar" element={
          <Suspense fallback={<PageLoader />}>
            <Calendar />
          </Suspense>
        } />
        <Route path="knowledge-base" element={
          <Suspense fallback={<PageLoader />}>
            <KnowledgeBase />
          </Suspense>
        } />
        <Route path="prompts" element={
          <Suspense fallback={<PageLoader />}>
            <PromptLibrary />
          </Suspense>
        } />
        <Route path="settings" element={
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        } />
        <Route path="profile" element={
          <Suspense fallback={<PageLoader />}>
            <Profile />
          </Suspense>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(22, 33, 62, 0.95)',
                color: '#e2e8f0',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: 'white',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
