import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../../utils/ScrollToTop';

/**
 * Root layout component that wraps all routes
 * Provides ScrollToTop functionality and any app-wide UI elements
 */
const RootLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RootLayout;