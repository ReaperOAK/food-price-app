import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../../utils/ScrollToTop';

/**
 * Root layout component that wraps all routes
 * Provides ScrollToTop functionality and any app-wide UI elements
 * Uses fixed dimensions to prevent CLS
 */
const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <ScrollToTop />
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;