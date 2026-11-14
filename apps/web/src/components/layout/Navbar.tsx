import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AlixLogo from '../common/AlixLogo';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  GraduationCap,
  Play,
  PenTool,
  Gamepad2,
  Search,
  Plus,
  LogOut,
  ChevronDown,
  ShieldCheck,
  LineChart,
  Menu,
  X,
  LayoutDashboard,
  LogIn,
  BookOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#331166] border-b border-[#4B1994] shadow-md select-none text-white">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo + Kahoot-style Mode Pills */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-1.5 group transition-transform active:scale-95 shrink-0"
          >
            <AlixLogo variant="white" size="md" showEduBadge={true} withCompanyTag={false} />
          </Link>

          {/* Kahoot-style Mode Switcher Buttons */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* 1. Activities (Discover - Green) */}
            <Link
              to="/discover"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95 ${
                location.pathname === '/discover'
                  ? 'bg-[#26890C] text-white ring-2 ring-white/30'
                  : 'bg-[#26890C]/85 hover:bg-[#26890C] text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Activities</span>
            </Link>

            {/* 2. Class Rosters (Study - Amber/Brown) */}
            <Link
              to="/dashboard?view=rosters"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black bg-[#A35200]/90 hover:bg-[#A35200] text-white transition-all shadow-sm active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5] text-amber-200" />
              <span>Rosters</span>
            </Link>

            {/* 3. ALIX Live (Present - Blue) */}
            <Link
              to="/dashboard?view=present"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black bg-[#1368CE]/90 hover:bg-[#105AB3] text-white transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3 h-3 fill-current stroke-[2.5]" />
              <span>Present</span>
            </Link>

            {/* 4. Create Activity (Make - Crimson) */}
            <Link
              to="/create"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95 ${
                location.pathname === '/create'
                  ? 'bg-[#E21B3C] text-white ring-2 ring-white/30'
                  : 'bg-[#E21B3C]/90 hover:bg-[#E21B3C] text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Make</span>
            </Link>

            {/* 5. Join Game (Multi-color shape badge) */}
            <Link
              to="/join"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-black bg-gradient-to-r from-violet-700 to-indigo-800 border border-violet-400/40 text-white hover:brightness-110 transition-all shadow-sm active:scale-95"
            >
              <span className="flex items-center gap-0.5 text-[11px] font-mono opacity-90">
                <span className="text-rose-400">▲</span>
                <span className="text-cyan-400">◆</span>
                <span className="text-amber-400">●</span>
                <span className="text-emerald-400">■</span>
              </span>
              <span>Join</span>
            </Link>
          </nav>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search public quizzes & rosters..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/95 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-alix-cyan-400 shadow-inner transition-all"
            />
          </div>
        </form>

        {/* Right: Quick Action Buttons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && user ? (
            <>
              {/* Blue Primary Create Button */}
              <Link
                to="/create"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1368CE] hover:bg-[#105AB3] text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-alix-cyan-400 to-emerald-400 text-slate-900 flex items-center justify-center font-black text-xs ring-2 ring-white/40 shadow-sm">
                    {user.avatarInitials}
                  </div>
                  <div className="hidden xl:block text-left text-xs">
                    <div className="font-bold text-white leading-tight truncate max-w-[100px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-white/70 leading-tight">Faculty</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70 hidden sm:block" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-scale-in">
                    <div className="pb-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-alix-indigo">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-alix-violet-50 text-[10px] font-semibold text-alix-violet-700">
                        <GraduationCap className="w-3 h-3" />
                        <span className="truncate">{user.institution}</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        to="/create"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        Question Banks & Creator
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        Class Rosters & Anti-Proxy
                      </Link>
                      <Link
                        to="/insights"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                      >
                        Classroom Insights
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-white hover:underline font-bold text-xs sm:text-sm"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#26890C] hover:bg-[#20740A] text-white font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                Sign up FREE
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#4B1994] bg-[#331166] text-white p-4 space-y-4 animate-fade-in shadow-2xl">
          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-white/10 border border-white/15 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-alix-cyan-400 to-emerald-400 text-slate-900 flex items-center justify-center font-black text-sm">
                {user.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate">{user.name}</div>
                <div className="text-[11px] text-white/70 truncate">{user.email}</div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <nav className="grid grid-cols-2 gap-2">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-[#26890C] text-white font-black text-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Activities</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-[#A35200] text-white font-black text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Rosters</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-[#1368CE] text-white font-black text-xs"
            >
              <Play className="w-4 h-4" />
              <span>Present Live</span>
            </Link>

            <Link
              to="/create"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-3 rounded-xl bg-[#E21B3C] text-white font-black text-xs"
            >
              <PenTool className="w-4 h-4" />
              <span>Make Quiz</span>
            </Link>

            <Link
              to="/join"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-800 border border-white/20 text-white font-black text-xs"
            >
              <Gamepad2 className="w-4 h-4 text-alix-cyan-400" />
              <span>Enter Classroom PIN</span>
            </Link>
          </nav>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 rounded-xl bg-white/10 text-white text-center font-bold text-xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 rounded-xl bg-[#26890C] text-white text-center font-bold text-xs"
              >
                Sign up FREE
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
