import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Menu } from 'lucide-react';
import NavRail from '../components/NavRail';

const pageTitles: Record<string, string> = {
  '/forge': 'AI Forge',
  '/analytics': 'Analytics Radar',
  '/comms': 'Communication Bridge',
};

export default function DashboardLayout() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Dashboard';

  const [dateTime, setDateTime] = useState(() => formatDateTime());
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth >= 1024;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const stored = window.localStorage.getItem('teacherHub.sidebarCollapsed');
    if (stored === null) {
      return true;
    }

    return stored === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setDateTime(formatDateTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const nextIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(nextIsDesktop);

      if (nextIsDesktop) {
        setMobileSidebarOpen(false);
      }
    };

    onResize();
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMenuToggle = () => {
    if (isDesktop) {
      setSidebarCollapsed((prev) => {
        const nextValue = !prev;
        window.localStorage.setItem('teacherHub.sidebarCollapsed', String(nextValue));
        return nextValue;
      });
      return;
    }

    setMobileSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-shell min-h-screen">
      <NavRail
        isDesktop={isDesktop}
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        onNavigate={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/25 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className={`relative min-h-screen transition-[padding] duration-300 ${isDesktop ? (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72') : 'lg:pl-0'}`}>
        {/* Header Bar - Cleaner, ChatGPT-like */}
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                aria-label={isDesktop ? (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : (mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar')}
                onClick={handleMenuToggle}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Teacher Hub</p>
                <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{pageTitle}</h1>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
              <Calendar size={14} />
              <span>{dateTime}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto max-w-[1520px] px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function formatDateTime(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}
