import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AlixLogo from '../common/AlixLogo';
import { useAuth } from '../../context/AuthContext';
import {
  Gamepad2,
  LineChart,
  PlusCircle,
  Play,
  UserCheck,
  LogIn,
  LogOut,
  GraduationCap,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Instructor links when logged in as Faculty
  const teacherNavLinks = [
    { name: 'My Activities', path: '/create', icon: BookOpen },
    { name: 'Class Rosters', path: '/dashboard', icon: ShieldCheck },
    { name: 'Classroom Insights', path: '/insights', icon: LineChart },
  ];

  // Guest/Student links when not logged in
  const guestNavLinks = [
    { name: 'Join Classroom', path: '/join', icon: Gamepad2 },
  ];

  const currentNavLinks = isAuthenticated ? teacherNavLinks : guestNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 border-b border-alix-slate-200 shadow-sm transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <AlixLogo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-alix-violet-700 bg-alix-violet-50 font-semibold'
                    : 'text-alix-slate-600 hover:text-alix-indigo hover:bg-alix-slate-100'
                }`}
              >
                Dashboard
              </Link>
            )}

            {currentNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-alix-violet-700 bg-alix-violet-50 font-semibold'
                      : 'text-alix-slate-600 hover:text-alix-indigo hover:bg-alix-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-alix-violet-500" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Action CTAs & Auth Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* If NOT logged in: Show Join PIN button for students */}
          {!isAuthenticated && (
            <Link
              to="/join"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-alix-slate-300 text-alix-indigo font-semibold text-xs sm:text-sm hover:border-alix-violet-400 hover:bg-alix-violet-50 transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4 text-alix-cyan-600" />
              <span>Join PIN</span>
            </Link>
          )}

          {/* Faculty Quick Action Buttons */}
          {isAuthenticated && (
            <>
              <Link
                to="/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-alix-slate-300 hover:border-alix-violet-400 text-alix-indigo font-semibold text-xs transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-alix-violet-600" />
                <span>+ Create</span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-alix-indigo text-white font-medium text-xs sm:text-sm hover:bg-alix-indigo/90 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current text-alix-cyan-300" />
                <span>ALIX Live</span>
              </Link>
            </>
          )}

          {/* Auth State: Profile or Sign In */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-alix-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-alix-violet-600 to-alix-cyan-400 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                  {user.avatarInitials}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-alix-indigo leading-tight truncate max-w-[110px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-alix-slate-400 leading-tight">Faculty</div>
                </div>
                <ChevronDown className="w-3 h-3 text-alix-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-alix-lg border border-alix-slate-200 p-3 z-50 animate-scale-in">
                  <div className="pb-3 border-b border-alix-slate-100">
                    <p className="text-xs font-bold text-alix-indigo">{user.name}</p>
                    <p className="text-[11px] text-alix-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-alix-violet-50 text-[10px] font-semibold text-alix-violet-700">
                      <GraduationCap className="w-3 h-3" />
                      <span className="truncate">{user.institution}</span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/create"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-2 py-1.5 text-xs text-alix-slate-700 hover:bg-alix-slate-50 rounded-lg font-medium"
                    >
                      Question Banks & Creator
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-2 py-1.5 text-xs text-alix-slate-700 hover:bg-alix-slate-50 rounded-lg font-medium"
                    >
                      Class Rosters & Anti-Proxy
                    </Link>
                    <Link
                      to="/insights"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-2 py-1.5 text-xs text-alix-slate-700 hover:bg-alix-slate-50 rounded-lg font-medium"
                    >
                      Classroom Insights
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-alix-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 sm:px-3.5 py-1.5 rounded-lg border border-alix-slate-300 text-alix-indigo font-semibold text-xs sm:text-sm hover:border-alix-violet-400 hover:bg-alix-violet-50 transition-all shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-alix-violet-600 text-white font-semibold text-xs sm:text-sm hover:bg-alix-violet-700 transition-all shadow-sm"
              >
                Faculty Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-alix-slate-700 hover:text-alix-indigo hover:bg-alix-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-alix-indigo" />
            ) : (
              <Menu className="w-5 h-5 text-alix-indigo" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-alix-slate-200 bg-white/95 backdrop-blur-xl shadow-xl animate-fade-in">
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* If logged in: User Profile Card */}
            {isAuthenticated && user && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-alix-violet-50 to-alix-cyan-50 border border-alix-violet-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-alix-violet-600 to-alix-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                  {user.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-alix-indigo truncate">{user.name}</div>
                  <div className="text-[11px] text-alix-slate-500 truncate">{user.email}</div>
                  <div className="text-[10px] text-alix-violet-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    <span>{user.institution || 'Academic Faculty'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'bg-alix-violet-100 text-alix-violet-800'
                        : 'text-alix-slate-700 hover:bg-alix-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-alix-violet-600" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === '/create'
                        ? 'bg-alix-violet-100 text-alix-violet-800'
                        : 'text-alix-slate-700 hover:bg-alix-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-alix-violet-600" />
                    <span>My Activities & Question Banks</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-alix-slate-700 hover:bg-alix-slate-100 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Class Rosters & Anti-Proxy</span>
                  </Link>

                  <Link
                    to="/insights"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === '/insights'
                        ? 'bg-alix-violet-100 text-alix-violet-800'
                        : 'text-alix-slate-700 hover:bg-alix-slate-100'
                    }`}
                  >
                    <LineChart className="w-4 h-4 text-alix-violet-600" />
                    <span>Classroom Insights</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/join"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-alix-indigo bg-alix-violet-50 hover:bg-alix-violet-100 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-alix-cyan-600" />
                    <span>Join Classroom with PIN</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Quick Actions & Auth */}
            <div className="pt-2 border-t border-alix-slate-100 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-alix-indigo text-white font-bold text-xs shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4 text-alix-cyan-400" />
                    <span>+ Create New Activity</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-alix-slate-300 text-alix-indigo font-bold text-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-alix-violet-600 text-white font-bold text-xs"
                  >
                    <span>Faculty Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
