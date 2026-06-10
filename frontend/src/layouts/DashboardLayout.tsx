import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Menu } from 'lucide-react';
import NavRail from '@/components/NavRail';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const pageTitles: Record<string, string> = {
  '/':          'Startseite',
  '/forge':     'KI-Werkzeug',
  '/analytics': 'Auswertung',
  '/subjects':  'Lehrplan',
  '/comms':     'Nachrichten',
};

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] ?? 'Lehrer Hub';
  const user = authApi.getUser();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login', { replace: true });
  };

  const [dateTime, setDateTime] = useState(() => formatDateTime());
  const [isDesktop, setIsDesktop] = useState(
    () => (typeof window === 'undefined' ? true : window.innerWidth >= 1024),
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem('teacherHub.sidebarCollapsed');
    return saved === null ? true : saved === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setDateTime(formatDateTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Responsive
  useEffect(() => {
    const onResize = () => {
      const next = window.innerWidth >= 1024;
      setIsDesktop(next);
      if (next) setMobileSidebarOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Desktop: toggle collapsed state (persisted)
  const toggleDesktopSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem('teacherHub.sidebarCollapsed', String(next));
      return next;
    });
  };

  const sidebarWidth = isDesktop
    ? sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED
    : 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Desktop sidebar (fixed) ─────────────────────── */}
      {isDesktop && (
        <NavRail
          isCollapsed={sidebarCollapsed}
          onToggle={toggleDesktopSidebar}
          onNavigate={() => undefined}
        />
      )}

      {/* ── Mobile sidebar (Sheet drawer) ──────────────── */}
      {!isDesktop && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 border-r">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavRail
              isCollapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
              onNavigate={() => setMobileSidebarOpen(false)}
              embedded
            />
          </SheetContent>
        </Sheet>
      )}

      {/* ── Main content ────────────────────────────────── */}
      <div
        className="flex min-h-screen flex-col transition-[padding-left] duration-300 ease-in-out"
        style={{ paddingLeft: isDesktop ? sidebarWidth : 0 }}
      >
        {/* ── Top Header ──────────────────────────────── */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="flex h-20 items-center justify-between gap-6 px-8">

            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile-only hamburger */}
              {!isDesktop && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-foreground h-11 w-11"
                  aria-label="Menü öffnen"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <Menu size={22} />
                </Button>
              )}

              {/* Page title */}
              <h1 className="truncate font-serif text-2xl font-medium text-foreground leading-tight">
                {pageTitle}
              </h1>
            </div>

            {/* Date / time + Logout */}
            <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={15} aria-hidden="true" />
                <time>{dateTime}</time>
              </div>
              {user && (
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                  <span className="text-foreground font-medium text-sm">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                    onClick={handleLogout}
                  >
                    Abmelden
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────── */}
        <main
          id="hauptinhalt"
          className="flex-1 w-full"
        >
          <div className="mx-auto max-w-7xl px-10 py-12 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function formatDateTime(): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}
