import React from 'react';

const RateSummary = ({ latestRate, latestRateDate, rateChange, percentageChange, trayPrice }) => {
  return (
    <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600 mb-2">Last Updated: {latestRateDate}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-gray-600">Current Rate</div>
          <div className="text-xl font-semibold">₹{latestRate.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600">Price Change</div>
          <div className={`text-xl font-semibold ${rateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {rateChange >= 0 ? '+' : ''}{rateChange.toFixed(2)} ({percentageChange.toFixed(1)}%)
          </div>
        </div>
        <div>
          <div className="text-gray-600">Tray Price (30 eggs)</div>
          <div className="text-xl font-semibold">₹{trayPrice.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default RateSummary;
