import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import HomePage from '@/pages/HomePage';
import AIForgePage from '@/pages/AIForgePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SubjectsPage from '@/pages/SubjectsPage';
import CommsPage from '@/pages/CommsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          {/* Default index → Home dashboard */}
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
