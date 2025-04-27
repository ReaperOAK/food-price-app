import React, { useState, useEffect } from 'react';

const StakeAdPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showFullAd, setShowFullAd] = useState(false);
  const stakeReferralLink = 'https://stake.bet/?c=vcB3Cqwu';

  // Show popup after 5 seconds of page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Handle redirect to stake.com
  const handleRedirect = () => {
    window.open(stakeReferralLink, '_blank');
    setIsVisible(false);
  };

  // Close the popup
  const handleClose = () => {
    setIsVisible(false);
  };

  // Toggle between mini and full ad
  const toggleAdSize = () => {
    setShowFullAd(!showFullAd);
  };

  if (!isVisible) return null;

  return (
    <>
      {showFullAd ? (
        // Full advertisement popup
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg w-full max-w-md shadow-2xl border border-yellow-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-yellow-500">Stake.com Special Offer</h3>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white mb-3">Join Stake.com today and enjoy:</p>
              <ul className="list-disc list-inside text-white space-y-2">
                <li>Exclusive bonuses for new members</li>
                <li>Wide range of games and betting options</li>
                <li>Fast withdrawals and secure transactions</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={handleRedirect}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                Join Now
              </button>
              <button 
                onClick={toggleAdSize}
                className="bg-transparent border border-gray-600 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-300"
              >
                Minimize
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Mini floating ad
        <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-gray-900 to-black p-3 rounded-lg shadow-lg border border-yellow-500 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-yellow-500">Stake.com</h3>
            <div className="flex space-x-2">
              <button 
                onClick={toggleAdSize}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                </svg>
              </button>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <p className="text-white text-sm mb-3">Try your luck at Stake.com today!</p>
          <button 
            onClick={handleRedirect}
            className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-bold py-1 px-3 rounded transition duration-300"
          >
            Join Now
          </button>
        </div>
      )}
    </>
  );
};

export default StakeAdPopup;