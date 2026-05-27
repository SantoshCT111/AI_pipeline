import { NavLink } from 'react-router-dom';
import { BarChart3, BookOpen, MessageSquare, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/forge', label: 'Forge', icon: Wand2 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/comms', label: 'Messages', icon: MessageSquare },
];

interface NavRailProps {
  isDesktop: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onNavigate: () => void;
  embedded?: boolean;
}

export default function NavRail({
  isDesktop,
  isCollapsed,
  isMobileOpen,
  onNavigate,
  embedded = false,
}: NavRailProps) {
  const compact = isDesktop && isCollapsed;

  return (
    <nav
      className={cn(
        'flex h-full min-h-screen flex-col border-r border-border bg-card transition-[transform,width] duration-300',
        embedded ? 'relative w-full' : 'fixed left-0 top-0 z-40 h-screen',
        !embedded && (isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'),
        !embedded && (compact ? 'w-[72px]' : 'w-64'),
        embedded && 'w-full',
      )}
    >
      <div className={cn('flex items-center border-b border-border px-4 py-5', compact && 'justify-center px-2')}>
        <NavLink to="/forge" onClick={onNavigate} className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen size={16} />
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="font-serif text-sm font-medium leading-tight text-foreground">Teacher Hub</p>
              <p className="text-[11px] text-muted-foreground tracking-wide">間 · ma</p>
            </div>
          )}
        </NavLink>
      </div>

      <div className={cn('flex flex-1 flex-col gap-1 p-3', compact && 'items-center')}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={compact ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg py-2.5 text-sm transition-colors',
                compact ? 'justify-center px-2 w-10' : 'gap-3 px-3',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <Icon size={18} />
            {!compact && <span>{label}</span>}
          </NavLink>
        ))}
      </div>

      <div className={cn('border-t border-border p-3', compact && 'flex justify-center')}>
        <div className={cn('flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5', compact && 'px-2')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            T
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Teacher</p>
              <p className="text-xs text-muted-foreground">Workspace</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
