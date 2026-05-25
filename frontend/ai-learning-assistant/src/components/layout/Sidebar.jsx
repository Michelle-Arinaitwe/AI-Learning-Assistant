import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, X, LogOut, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navlinks = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/documents',  label: 'Documents',  icon: FileText },
  { to: '/flashcards', label: 'Flashcards', icon: BookOpen },
];

// isMobileOpen  — slide-in overlay on small screens
// isCollapsed   — icon-only mode on md+ (YouTube style)
// closeMobile   — called when a link is tapped or the backdrop is clicked
const Sidebar = ({ isMobileOpen, isCollapsed, closeMobile }) => {
  const { logout }  = useAuth();
  const navigate    = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ── Mobile dark backdrop ──────────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ─────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-white/90 backdrop-blur-lg border-r border-slate-200/60
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          md:translate-x-0
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
        `}
      >

        {/* ── Logo row ──────────────────────────────────────────── */}
        <div
          className={`flex items-center h-16 border-b border-slate-200/60 shrink-0 transition-all duration-300 ${
            isCollapsed ? 'md:justify-center px-0' : 'px-4 justify-between'
          }`}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-md shadow-sky-500/25 shrink-0">
              <Bot className="text-white" size={20} strokeWidth={2.5} />
            </div>

            {/* Title — hidden when collapsed on desktop */}
            <h1
              className={`text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap transition-all duration-200 ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              AI Learning Assistant
            </h1>
          </div>

          {/* X close — mobile only */}
          <button
            onClick={closeMobile}
            className="text-slate-400 hover:text-slate-800 transition-colors md:hidden shrink-0"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Nav links ──────────────────────────────────────────── */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navlinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              title={isCollapsed ? label : ''}
              className={({ isActive }) =>
                `group flex items-center gap-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'md:justify-center md:px-0 px-4' : 'px-4'
                } ${
                  isActive
                    ? 'bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-600 ring-1 ring-sky-100'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon
                size={18}
                strokeWidth={2.5}
                className="shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              {/* Label — hidden when collapsed on desktop */}
              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  isCollapsed ? 'md:hidden' : ''
                }`}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── Logout ─────────────────────────────────────────────── */}
        <div className="px-2 py-3 border-t border-slate-200/60 shrink-0">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`group flex items-center gap-3 w-full py-2.5 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 ${
              isCollapsed ? 'md:justify-center md:px-0 px-4' : 'px-4'
            }`}
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${
                isCollapsed ? 'md:hidden' : ''
              }`}
            >
              Logout
            </span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
