import React from 'react';
import { NavLink } from 'react-router-dom';
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

  return (
    <aside
      className={`w-60 bg-white border-r border-[#E5E5E5] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none ${className}`}
    >
      <div className="p-3.5 space-y-3 overflow-y-auto">
        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            const handleClick = (e: React.MouseEvent) => {
              if (item.name === 'Class Rosters' && onOpenRosters) {
                e.preventDefault();
                onOpenRosters();
              }
            };

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleClick}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#46178F] text-white font-semibold shadow-xs'
                      : 'text-[#252525] hover:bg-[#F3F3F3] hover:text-[#46178F]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
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
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-[#E5E5E5] space-y-1 bg-white">
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Platform Admin & Keys</span>
          </NavLink>
        )}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#626262] hover:bg-[#F3F3F3] hover:text-[#252525] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#626262]" />
          <span>Help & Tutorial</span>
        </NavLink>
        <div className="px-3 pt-1 text-[11px] text-[#626262] font-normal">
          ALIX Platform • RKGlobal EdTech
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
