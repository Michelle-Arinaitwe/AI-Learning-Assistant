import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

// Header receives two separate toggle callbacks:
//   toggleMobile  → shown only on small screens, opens the sidebar overlay
//   toggleDesktop → shown only on md+, collapses / expands the sidebar
const Header = ({ toggleMobile, toggleDesktop }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center px-4 shrink-0">
      <div className="flex items-center justify-between w-full">

        {/* ── Left: hamburger buttons ─────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Mobile hamburger — opens overlay sidebar */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-sky-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={toggleMobile}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          {/* Desktop hamburger — collapses / expands sidebar */}
          <button
            className="hidden md:inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-sky-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            onClick={toggleDesktop}
            aria-label="Toggle sidebar"
          >
            <Menu size={22} />
          </button>

          <span className="text-xl font-bold text-sky-600 ml-1">AI Learning Assistant</span>
        </div>

        {/* ── Right: bell + user ──────────────────────────────────── */}
        <div className="flex items-center gap-1">

          <button
            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-sky-500 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
          </button>

          {/* User chip */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
              <User size={16} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 leading-tight">
                {user?.email || ''}
              </p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
