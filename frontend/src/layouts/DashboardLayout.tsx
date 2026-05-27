import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Menu } from 'lucide-react';
import NavRail from '@/components/NavRail';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
const pageTitles: Record<string, string> = {
  '/forge': 'AI Forge',
  '/analytics': 'Analytics',
  '/comms': 'Messages',
};

export default function DashboardLayout() {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? 'Teacher Hub';

  const [dateTime, setDateTime] = useState(() => formatDateTime());
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1024,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('teacherHub.sidebarCollapsed');
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
      if (nextIsDesktop) setMobileSidebarOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMenuToggle = () => {
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

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 256) : 0;

  return (
    <div className="min-h-screen bg-background">
      {isDesktop ? (
        <NavRail
          isDesktop={isDesktop}
          isCollapsed={sidebarCollapsed}
          isMobileOpen={false}
          onNavigate={() => undefined}
        />
      ) : (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0 border-r">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavRail
              isDesktop={false}
              isCollapsed={false}
              isMobileOpen
              embedded
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      <div
        className="min-h-screen transition-[padding] duration-300"
        style={{ paddingLeft: isDesktop ? sidebarWidth : 0 }}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={isDesktop ? 'Toggle sidebar' : 'Open menu'}
                onClick={handleMenuToggle}
              >
                <Menu size={18} />
              </Button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Teacher Hub</p>
                <h1 className="truncate font-serif text-lg font-medium text-foreground">{pageTitle}</h1>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{dateTime}</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
