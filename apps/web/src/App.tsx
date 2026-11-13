import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './components/common/LoadingScreen';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const JoinPage = lazy(() => import('./pages/JoinPage'));
const PlayPage = lazy(() => import('./pages/PlayPage'));
const HostPage = lazy(() => import('./pages/HostPage'));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Student & Landing Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/play/:sessionId" element={<PlayPage />} />
            <Route path="/play" element={<Navigate to="/join" replace />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Instructor Routes (Secured Question Banks, Controls & Analytics) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <InsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/:sessionId"
              element={
                <ProtectedRoute>
                  <HostPage />
                </ProtectedRoute>
              }
            />
            <Route path="/host" element={<Navigate to="/dashboard" replace />} />

            {/* Module Fallbacks */}
            <Route
              path="/poll"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/think"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
