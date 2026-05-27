import { NavLink } from 'react-router-dom';
import { Gem, Wand2, BarChart3, MessageSquare, X } from 'lucide-react';

const navItems = [
  { to: '/forge', label: 'AI Forge', icon: Wand2 },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/comms', label: 'Messages', icon: MessageSquare },
];

interface NavRailProps {
  isDesktop: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onNavigate: () => void;
}

export default function NavRail({ isDesktop, isCollapsed, isMobileOpen, onNavigate }: NavRailProps) {
  const compact = isDesktop && isCollapsed;

  return (
    <nav
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-auto border-r border-white/10 bg-slate-950/96 pt-4 text-white shadow-[20px_0_60px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-[transform,width] duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${compact ? 'w-20' : 'w-72'}`}
    >
      {/* Brand Area / New Chat Button */}
      <div className={`flex items-center px-3 py-2 ${compact ? 'justify-center' : 'gap-2'}`}>
        <NavLink
          to="/forge"
          onClick={onNavigate}
          className={`group flex w-full cursor-pointer items-center rounded-2xl py-2.5 transition-colors hover:bg-white/10 ${compact ? 'justify-center px-2' : 'gap-3 px-3'}`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#171717] shadow-sm">
            <Gem size={14} />
          </div>
          {!compact && (
            <>
              <span className="text-sm font-medium tracking-wide text-white">
                New Quiz
              </span>
              <Wand2 size={16} className="ml-auto text-white/45 transition-colors group-hover:text-white" />
            </>
          )}
        </NavLink>

        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onNavigate}
          className={`ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white ${isDesktop ? 'lg:hidden' : 'block'}`}
        >
          <X size={18} />
        </button>
      </div>

      <div className={`px-3 py-2 ${compact ? 'hidden' : 'block'}`}>
        <span className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Main Menu</span>
      </div>

      {/* Navigation Links */}
      <div className={`flex flex-1 flex-col gap-1 ${compact ? 'px-2' : 'px-3'}`}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center rounded-2xl py-3 text-sm transition-all duration-200',
                compact ? 'justify-center px-2' : 'gap-3 px-3',
                isActive
                  ? 'bg-white/10 text-white font-medium shadow-sm'
                  : 'text-white/70 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={16} />
            {!compact && <span>{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-3">
        {/* User Info Container */}
        <div className={`flex cursor-pointer items-center rounded-2xl py-3 transition-colors hover:bg-white/10 ${compact ? 'justify-center px-2' : 'gap-3 px-3'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
            <span className="text-xs font-medium text-white">TC</span>
          </div>
          {!compact && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-white">Sarah Jenkins</span>
              <span className="text-xs text-white/45">Teacher workspace</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
