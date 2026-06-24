import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  Home,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForge } from '@/contexts/ForgeContext';

const navItems = [
  { to: '/',          label: 'Startseite',  icon: Home,          end: true  },
  { to: '/forge',     label: 'KI-Werkzeug', icon: Wand2,         end: false },
  { to: '/analytics', label: 'Auswertung',  icon: BarChart3,     end: false },
  { to: '/subjects',  label: 'Fächer',      icon: BookOpen,      end: false },
  { to: '/comms',     label: 'Nachrichten', icon: MessageSquare, end: false },
];

interface NavRailProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  embedded?: boolean;
}

const EXPANDED_W  = 'w-60';   // 240px expanded
const COLLAPSED_W = 'w-[72px]';   // 72px collapsed

export default function NavRail({
  isCollapsed,
  onToggle,
  onNavigate,
  embedded = false,
}: NavRailProps) {
  const { phase } = useForge();
  const forgeInProgress = phase !== 'input';
  return (
    <nav
      aria-label="Hauptnavigation"
      className={cn(
        'flex h-full min-h-screen flex-col border-r border-border bg-card',
        'transition-[transform,width] duration-300 ease-in-out',
        embedded
          ? 'relative w-full'
          : cn(
              'fixed left-0 top-0 z-40 h-screen',
              isCollapsed ? COLLAPSED_W : EXPANDED_W,
            ),
      )}
    >
      {/* ── Brand / Toggle button ─────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Seitenleiste öffnen' : 'Seitenleiste schließen'}
        className={cn(
          'group flex w-full items-center border-b border-border',
          'transition-colors hover:bg-muted/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isCollapsed ? 'justify-center px-0 py-6' : 'gap-4 px-5 py-6',
        )}
      >
        {/* Logo square */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-95">
          <BookOpen size={20} aria-hidden="true" />
        </div>

        {/* Label + chevron (expanded only) */}
        {!isCollapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-serif text-base font-semibold leading-tight text-foreground">
                Lehrer Hub
              </p>
              <p className="text-xs text-muted-foreground tracking-wide mt-0.5">間 · ma</p>
            </div>
            <ChevronLeft
              size={18}
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
            />
          </>
        )}
      </button>

      {/* ── Nav items ─────────────────────────────────── */}
      <ul
        role="list"
        className={cn(
          'flex flex-1 flex-col gap-1 p-4',
          isCollapsed && 'items-center',
        )}
      >
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              title={isCollapsed ? label : undefined}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center rounded-xl text-[15px] font-medium',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isCollapsed
                    ? 'justify-center w-11 h-11'
                    : 'gap-3.5 px-4 py-3.5',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left border */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                    />
                  )}
                  <div className="relative shrink-0">
                    <Icon
                      size={22}
                      aria-hidden="true"
                      className={cn(
                        'transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    {/* Pulsing dot when a quiz is in progress */}
                    {to === '/forge' && forgeInProgress && !isActive && (
                      <span
                        aria-label="Quiz in Bearbeitung"
                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse border-2 border-background"
                      />
                    )}
                  </div>
                  {!isCollapsed && (
                    <span className={cn('truncate', isActive ? 'text-primary' : '')}>
                      {label}
                      {to === '/forge' && forgeInProgress && !isActive && (
                        <span className="ml-2 text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                          In Bearbeitung
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── User footer ───────────────────────────────── */}
      <div className={cn('border-t border-border p-4', isCollapsed && 'flex justify-center')}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl bg-muted/60 py-3',
            isCollapsed ? 'justify-center px-2 w-12' : 'px-4',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            L
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">Lehrkraft</p>
              <p className="text-xs text-muted-foreground mt-0.5">Arbeitsbereich</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
