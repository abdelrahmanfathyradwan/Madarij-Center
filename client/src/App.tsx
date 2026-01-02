import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { getCurrentUser } from './redux/slices/authSlice';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HalqatPage from './pages/HalqatPage';
import StudentsPage from './pages/StudentsPage';
import SessionsPage from './pages/SessionsPage';
import FinancialPage from './pages/FinancialPage';
import OnboardingPage from './pages/OnboardingPage';
import InterviewSchedulePage from './pages/InterviewSchedulePage';
import AttendanceRecordingPage from './pages/AttendanceRecordingPage';
import UsersPage from './pages/UsersPage';
import FridayManagementPage from './pages/FridayManagementPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) { dispatch(getCurrentUser()); }
  }, [dispatch, token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="halqat" element={<HalqatPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:sessionId/attendance" element={<AttendanceRecordingPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="interviews" element={<InterviewSchedulePage />} />
        <Route path="friday" element={<FridayManagementPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">الإعدادات</h1><p className="text-[var(--text-secondary)]">قريباً...</p></div>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;