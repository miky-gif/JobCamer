import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ChatProvider } from './context/ChatContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Onboarding } from './pages/Onboarding';
import { OnboardingNew } from './pages/OnboardingNew';
import { Search } from './pages/Search';
import { JobDetail } from './pages/JobDetail';
import { JobDetailNew } from './pages/JobDetailNew';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { CompleteProfile } from './pages/CompleteProfile';
import { Settings } from './pages/Settings';
import { WorkerProfile } from './pages/WorkerProfile';
import { Payment } from './pages/Payment';
import { PostJob } from './pages/PostJob';
import { Notifications } from './pages/Notifications';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { EmployerDashboardNew } from './pages/EmployerDashboardNew';
import { EmployerDashboardSimple } from './pages/EmployerDashboardSimple';
import { EmployerDashboardModern } from './pages/EmployerDashboardModern';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Routes sans header (plein écran) */}
        <Route path="/onboarding" element={<OnboardingNew />} />
        
        {/* Routes avec header */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />
                <Route path="/job/:jobId" element={<JobDetailNew />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/workers/:id" element={<WorkerProfile />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complete-profile"
                  element={
                    <ProtectedRoute>
                      <CompleteProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-job"
                  element={
                    <ProtectedRoute>
                      <PostJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employer-dashboard"
                  element={
                    <ProtectedRoute>
                      <EmployerDashboardModern />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <JobProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </JobProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
