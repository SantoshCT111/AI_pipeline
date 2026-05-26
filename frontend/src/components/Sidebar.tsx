import { NavLink } from 'react-router-dom';
import { ArrowRight, BookOpenText, ChartColumnBig, MessageSquareText, Sparkles } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: 'spark' | 'chart' | 'message';
};

interface SidebarProps {
  navItems: NavItem[];
  isDesktop: boolean;
  collapsed: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}

const iconMap = {
  spark: Sparkles,
  chart: ChartColumnBig,
  message: MessageSquareText,
};

export default function Sidebar({ navItems, isDesktop, collapsed, mobileOpen, onNavigate }: SidebarProps) {
  const compact = isDesktop && collapsed;

  return (
    <aside className={`sidebar ${compact ? 'sidebar--compact' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
      <div className={`sidebar__brand ${compact ? 'sidebar__brand--compact' : ''}`}>
        <NavLink to="/forge" onClick={onNavigate} className="brand-chip">
          <span className="brand-chip__mark">
            <BookOpenText size={14} />
          </span>
          {!compact && (
            <span className="brand-chip__text">
              <strong>New Quiz</strong>
              <small>Create with AI</small>
            </span>
          )}
        </NavLink>
      </div>

      {!compact && <p className="sidebar__label">Main Menu</p>}

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''} ${compact ? 'nav-link--compact' : ''}`}
            >
              <Icon size={16} />
              {!compact && <span>{item.label}</span>}
              {!compact && <ArrowRight size={14} className="nav-link__arrow" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className={`profile-card ${compact ? 'profile-card--compact' : ''}`}>
          <div className="profile-card__avatar">SJ</div>
          {!compact && (
            <div className="profile-card__text">
              <strong>Sarah Jenkins</strong>
              <span>Teacher workspace</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
