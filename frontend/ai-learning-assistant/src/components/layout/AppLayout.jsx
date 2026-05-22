import React from 'react';

// AppLayout wraps every protected page.
// Add your nav bar, sidebar, footer here as the UI develops.
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: add <Navbar /> here */}
      <main className="w-full">
        {children}
      </main>
      {/* TODO: add <Footer /> here */}
    </div>
  );
};

export default AppLayout;
