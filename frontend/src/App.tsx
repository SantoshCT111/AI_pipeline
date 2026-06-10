import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { authApi } from '@/services/api';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import AIForgePage from '@/pages/AIForgePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SubjectsPage from '@/pages/SubjectsPage';
import CommsPage from '@/pages/CommsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={
          authApi.isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
        } />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="/forge"     element={<AIForgePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/subjects"  element={<SubjectsPage />} />
          <Route path="/comms"     element={<CommsPage />} />
          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
