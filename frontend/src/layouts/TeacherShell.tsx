import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { type NavItem } from '../components/Sidebar';

const NAV_ITEMS: NavItem[] = [
  { to: '/forge', label: 'AI Forge', icon: 'spark' },
  { to: '/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/comms', label: 'Messages', icon: 'message' },
];

const PAGE_TITLES: Record<string, string> = {
  '/forge': 'AI Forge',
  '/analytics': 'Analytics Radar',
  '/comms': 'Communication Bridge',
};

function formatDateTime() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

export default function TeacherShell() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Teacher Hub';

  const [isDesktop, setIsDesktop] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1100));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('teacherHub.sidebarCollapsed');
    return saved === null ? true : saved === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dateTime, setDateTime] = useState(formatDateTime());

  useEffect(() => {
    const onResize = () => {
      const nextDesktop = window.innerWidth >= 1100;
      setIsDesktop(nextDesktop);
      if (nextDesktop) {
        setMobileSidebarOpen(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setDateTime(formatDateTime()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const sidebarWidth = useMemo(() => (sidebarCollapsed ? 92 : 308), [sidebarCollapsed]);

  const handleMenuClick = () => {
    if (isDesktop) {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        window.localStorage.setItem('teacherHub.sidebarCollapsed', String(next));
        return next;
      });
      return;
    }

    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-shell">
      <Sidebar
        navItems={NAV_ITEMS}
        isDesktop={isDesktop}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="shell-main" style={{ paddingLeft: isDesktop ? `${sidebarWidth}px` : 0 }}>
        <header className="topbar glass-panel">
          <div className="container topbar__inner">
            <div className="topbar__title-wrap">
              <button type="button" className="icon-button" aria-label="Toggle sidebar" onClick={handleMenuClick}>
                <Menu size={18} />
              </button>
              <div>
                <p className="eyebrow">Teacher Hub</p>
                <h1 className="page-title">{pageTitle}</h1>
              </div>
            </div>

            <div className="topbar__status">
              <CalendarDays size={14} />
              <span>{dateTime}</span>
            </div>
          </div>
        </header>

        <main className="container page-stack">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
