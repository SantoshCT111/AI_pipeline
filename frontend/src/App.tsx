import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import DashboardLayout from '@/layouts/DashboardLayout';
import AIForgePage from '@/pages/AIForgePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import CommsPage from '@/pages/CommsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/forge" element={<AIForgePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/comms" element={<CommsPage />} />
          <Route path="*" element={<Navigate to="/forge" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
