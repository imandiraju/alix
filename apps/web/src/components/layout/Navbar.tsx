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
  BookOpen,
  Bell,
  Sparkles,
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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E5E5E5] select-none text-[#252525] shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
          >
            <AlixLogo variant="primary" size="md" showEduBadge={true} withCompanyTag={true} />
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#626262] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search public quizzes & rosters..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F7F7F8] hover:bg-white text-sm text-[#252525] placeholder-[#626262] font-normal border border-[#E5E5E5] outline-none focus:bg-white focus:border-[#46178F] focus:ring-2 focus:ring-[#46178F]/10 transition-all"
            />
          </div>
        </form>

        {/* Right: Actions, Create Button & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Join Game PIN Link */}
          <Link
            to="/join"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-[#252525] hover:bg-[#F3F3F3] hover:border-slate-300 font-medium text-xs sm:text-sm transition-all"
          >
            <span className="flex items-center gap-0.5 text-[10px]">
              <span className="text-[#E21B5A]">▲</span>
              <span className="text-[#1368CE]">◆</span>
              <span className="text-[#E66C1C]">●</span>
              <span className="text-[#00A6A6]">■</span>
            </span>
            <span>Join PIN</span>
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* Admin Portal Button - Strictly for Platform Admin (alixadmin@gmail.com) */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all shadow-xs"
                  title="Platform Admin & OpenRouter Key Vault"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {/* Signature Kahoot-Blue Create Button */}
              <Link
                to="/create"
                className="inline-flex items-center gap-1.5 bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#46178F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.avatarInitials}
                  </div>
                  <div className="hidden xl:block text-left text-xs">
                    <div className="font-semibold text-[#252525] leading-tight truncate max-w-[110px]">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-[#626262] leading-tight font-normal">Faculty</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#626262] hidden sm:block" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-[#252525] rounded-xl shadow-xl border border-[#E5E5E5] p-3 z-50 animate-scale-in">
                    <div className="pb-3 border-b border-[#E5E5E5]">
                      <p className="text-sm font-semibold text-[#252525] truncate">{user.name}</p>
                      <p className="text-xs text-[#626262] truncate mt-0.5">{user.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-[11px] font-medium text-[#46178F]">
                        <GraduationCap className="w-3 h-3" />
                        <span className="truncate">{user.institution}</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <Link
                        to="/create"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#252525] hover:bg-[#F3F3F3] rounded-lg font-medium transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#46178F]" />
                        <span>Question Banks & Creator</span>
                      </Link>
                      <Link
                        to="/dashboard?view=rosters"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#252525] hover:bg-[#F3F3F3] rounded-lg font-medium transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00A6A6]" />
                        <span>Class Rosters & Anti-Proxy</span>
                      </Link>
                      <Link
                        to="/insights"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#252525] hover:bg-[#F3F3F3] rounded-lg font-medium transition-colors"
                      >
                        <LineChart className="w-3.5 h-3.5 text-[#1368CE]" />
                        <span>Classroom Insights</span>
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg font-semibold transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Platform Admin & Keys</span>
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-bold">
                            Active
                          </span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E5E5E5]">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                className="px-3 py-1.5 text-[#252525] hover:text-[#46178F] font-semibold text-xs sm:text-sm"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#46178F] hover:bg-[#391275] text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
              >
                Sign up FREE
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#252525] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white text-[#252525] p-4 space-y-4 animate-fade-in shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#626262] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes & rosters..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F7F7F8] text-xs text-[#252525] placeholder-[#626262] font-normal border border-[#E5E5E5] outline-none"
              />
            </div>
          </form>

          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-[#F7F7F8] border border-[#E5E5E5] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#46178F] text-white flex items-center justify-center font-bold text-xs">
                {user.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[#252525] truncate">{user.name}</div>
                <div className="text-[11px] text-[#626262] truncate">{user.email}</div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#252525] hover:bg-[#F3F3F3]"
            >
              <Compass className="w-4 h-4 text-[#46178F]" />
              <span>Activities & Quizzes</span>
            </Link>

            <Link
              to="/dashboard?view=rosters"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#252525] hover:bg-[#F3F3F3]"
            >
              <ShieldCheck className="w-4 h-4 text-[#00A6A6]" />
              <span>Class Rosters</span>
            </Link>

            <Link
              to="/create"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#252525] hover:bg-[#F3F3F3]"
            >
              <PenTool className="w-4 h-4 text-[#1368CE]" />
              <span>Make Quiz</span>
            </Link>

            <Link
              to="/insights"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm font-medium text-[#252525] hover:bg-[#F3F3F3]"
            >
              <LineChart className="w-4 h-4 text-[#6F2DBD]" />
              <span>Reports & Insights</span>
            </Link>

            <Link
              to="/join"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#1368CE] text-white font-semibold text-sm shadow-xs"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Join PIN</span>
            </Link>
          </nav>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5E5]">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 rounded-lg bg-[#F3F3F3] text-[#252525] text-center font-medium text-xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 rounded-lg bg-[#46178F] text-white text-center font-semibold text-xs"
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
