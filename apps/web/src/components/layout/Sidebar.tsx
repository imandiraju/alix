import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Gamepad2,
  BarChart2,
  Lightbulb,
  Users2,
  TrendingUp,
  PlusSquare,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const modules = [
    {
      name: 'ALIX Play',
      subtitle: 'Quizzes & Games',
      path: '/play/demo',
      icon: Gamepad2,
      badge: 'Live',
      badgeColor: 'bg-alix-violet-100 text-alix-violet-700',
    },
    {
      name: 'ALIX Poll',
      subtitle: 'Opinion & Voting',
      path: '/poll',
      icon: BarChart2,
      badge: 'Interactive',
      badgeColor: 'bg-alix-cyan-100 text-alix-cyan-700',
    },
    {
      name: 'ALIX Think',
      subtitle: 'Concept Checks',
      path: '/think',
      icon: Lightbulb,
    },
    {
      name: 'ALIX Teams',
      subtitle: 'Group Collaboration',
      path: '/teams',
      icon: Users2,
    },
    {
      name: 'ALIX Insights',
      subtitle: 'Learning Analytics',
      path: '/insights',
      icon: TrendingUp,
    },
    {
      name: 'ALIX Create',
      subtitle: 'Authoring Studio',
      path: '/create',
      icon: PlusSquare,
      highlight: true,
    },
  ];

  return (
    <aside
      className={`w-64 bg-white border-r border-alix-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none ${className}`}
    >
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Core Navigation */}
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-alix-slate-400 mb-2">
            Workspace
          </p>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-alix-violet-50 text-alix-violet-700 font-semibold'
                  : 'text-alix-slate-600 hover:bg-alix-slate-50 hover:text-alix-indigo'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-alix-indigo" />
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* Product Modules List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-alix-slate-400">
              ALIX Modules
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-alix-slate-100 text-alix-slate-500">
              6 Modules
            </span>
          </div>

          <div className="space-y-1">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <NavLink
                  key={mod.name}
                  to={mod.path}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-alix-violet-50 text-alix-violet-800 font-semibold border-l-4 border-alix-violet-600'
                        : 'text-alix-slate-600 hover:bg-alix-slate-50 hover:text-alix-indigo'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-md ${
                        mod.highlight
                          ? 'bg-alix-violet-600 text-white'
                          : 'bg-alix-slate-100 text-alix-indigo group-hover:bg-alix-violet-100 group-hover:text-alix-violet-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium leading-tight truncate">
                        {mod.name}
                      </div>
                      <div className="text-[11px] text-alix-slate-400 leading-tight">
                        {mod.subtitle}
                      </div>
                    </div>
                  </div>

                  {mod.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mod.badgeColor}`}
                    >
                      {mod.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-alix-indigo to-alix-violet-950 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15">
            <Sparkles className="w-20 h-20 text-alix-cyan" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-alix-cyan-400" />
              <span className="text-xs font-bold text-alix-cyan-300 uppercase tracking-wide">
                Active Learning
              </span>
            </div>
            <p className="text-xs text-alix-slate-200 mb-3 leading-relaxed">
              Launch instant concept checks or competitive team live rounds.
            </p>
            <NavLink
              to="/host/session-demo"
              className="inline-block text-xs font-semibold px-2.5 py-1.5 rounded bg-alix-violet-600 hover:bg-alix-violet-500 text-white transition-colors"
            >
              Start ALIX Live →
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-alix-slate-200 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-alix-slate-600 hover:bg-alix-slate-50 transition-colors"
        >
          <Settings className="w-4 h-4 text-alix-slate-400" />
          <span>Platform Settings</span>
        </NavLink>
        <div className="px-3 pt-2 text-[11px] text-alix-slate-400">
          ALIX v0.1.0 • EdTech SaaS
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
