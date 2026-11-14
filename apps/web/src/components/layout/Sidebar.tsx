import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  BookOpen,
  ShieldCheck,
  LineChart,
  Users,
  Settings,
  HelpCircle,
  Sparkles,
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
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      name: 'Library & Creator',
      path: '/create',
      icon: BookOpen,
    },
    {
      name: 'Class Rosters',
      path: '/dashboard',
      icon: ShieldCheck,
      badge: 'Protected',
      badgeColor: 'bg-alix-violet-100 text-alix-violet-800',
    },
    {
      name: 'Reports & Insights',
      path: '/insights',
      icon: LineChart,
    },
    {
      name: 'Student Groups',
      path: '/dashboard',
      icon: Users,
    },
  ];

  return (
    <aside
      className={`w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none ${className}`}
    >
      <div className="p-3 space-y-4 overflow-y-auto">
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
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-alix-violet-50 text-alix-violet-800 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Kahoot-style Promo Action Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#331166] to-[#1E0938] text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5 text-alix-cyan-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ALIX Live</span>
            </div>
            <p className="text-xs text-slate-200 leading-snug">
              Launch interactive quizzes & live concept checks to your students.
            </p>
            <button
              type="button"
              onClick={onStartLive}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1368CE] hover:bg-[#105AB3] text-white font-black text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start Live Host</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <NavLink
          to="/admin"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-amber-800 bg-amber-50/60 hover:bg-amber-100/80 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Platform Admin & Keys</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help & Tutorial</span>
        </NavLink>
        <div className="px-3 text-[10px] text-slate-400 font-medium">
          ALIX Platform • Higher Education
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
