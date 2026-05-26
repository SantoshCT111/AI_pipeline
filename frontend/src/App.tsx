import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import TeacherShell from './layouts/TeacherShell';
import ForgePage from './pages/ForgePage';
import AnalyticsPage from './pages/AnalyticsPage';
import MessagesPage from './pages/CommsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<TeacherShell />}>
          <Route path="/forge" element={<ForgePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/comms" element={<MessagesPage />} />
          <Route path="*" element={<Navigate to="/forge" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
