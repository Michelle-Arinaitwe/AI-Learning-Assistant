import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// AppLayout wraps every protected page.
// - Desktop: sidebar is always visible, toggles between wide (w-64) and collapsed (w-16)
// - Mobile:  sidebar slides in as a full overlay, hidden by default
const AppLayout = ({ children }) => {
  const [isMobileOpen,  setIsMobileOpen]  = useState(false);
  const [isCollapsed,   setIsCollapsed]   = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        closeMobile={() => setIsMobileOpen(false)}
      />

      {/* Content shifts right on desktop to sit beside the sidebar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <Header
          toggleMobile={() => setIsMobileOpen(prev => !prev)}
          toggleDesktop={() => setIsCollapsed(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
