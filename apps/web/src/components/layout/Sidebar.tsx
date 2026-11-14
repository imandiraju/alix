import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  BookOpen,
  ShieldCheck,
  LineChart,
  Users,
  HelpCircle,
  Play,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onStartLive?: () => void;
  onOpenRosters?: () => void;
  onDiscoverClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onStartLive,
  onOpenRosters,
  onDiscoverClick,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: Home,
    },
    {
      name: 'Discover',
      path: '/discover',
      icon: Compass,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      name: 'Library & Creator',
      path: '/create',
      icon: BookOpen,
    },
    {
      name: 'Class Rosters',
      path: '/dashboard?view=rosters',
      icon: ShieldCheck,
      badge: 'Protected',
      badgeColor: 'bg-purple-50 text-[#46178F] border border-purple-200',
    },
    {
      name: 'Reports & Insights',
      path: '/insights',
      icon: LineChart,
    },
    {
      name: 'Student Groups',
      path: '/dashboard?view=teams',
      icon: Users,
    },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;

    if (item.name === 'Home') {
      return (
        currentPath === '/dashboard' &&
        (!currentSearch || currentSearch === '' || currentSearch === '?view=all' || currentSearch.startsWith('?q='))
      );
    }
    if (item.name === 'Class Rosters') {
      return currentPath === '/dashboard' && currentSearch.includes('view=rosters');
    }
    if (item.name === 'Student Groups') {
      return currentPath === '/dashboard' && currentSearch.includes('view=teams');
    }
    if (item.name === 'Discover') {
      return currentPath.startsWith('/discover');
    }
    if (item.name === 'Library & Creator') {
      return currentPath.startsWith('/create');
    }
    if (item.name === 'Reports & Insights') {
      return currentPath.startsWith('/insights');
    }
    return false;
  };

  return (
    <aside
      className={`w-60 bg-white border-r border-[#E5E5E5] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none ${className}`}
    >
      <div className="p-3.5 space-y-3 overflow-y-auto">
        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);

            const handleClick = (e: React.MouseEvent) => {
              if (item.name === 'Class Rosters' && onOpenRosters) {
                e.preventDefault();
                onOpenRosters();
              }
            };

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleClick}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#46178F] text-white font-semibold shadow-xs'
                    : 'text-[#252525] hover:bg-[#F3F3F3] hover:text-[#46178F]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#626262] group-hover:text-[#46178F]'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && !isActive && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-[#E5E5E5] space-y-1 bg-white">
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              location.pathname.startsWith('/admin')
                ? 'bg-amber-200 text-amber-950 font-bold'
                : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Platform Admin & Keys</span>
          </Link>
        )}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#626262] hover:bg-[#F3F3F3] hover:text-[#252525] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#626262]" />
          <span>Help & Tutorial</span>
        </Link>
        <div className="px-3 pt-1 text-[11px] text-[#626262] font-normal">
          Academic Learning Platform • RKGlobal EdTech
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
