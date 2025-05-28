import { formatPrice } from '../../utils/formatters';

const QuickInfo = ({ todayRate, trayPrice, weeklyChange, weeklyChangePercent }) => (
  <div className="fixed bottom-4 right-4 bg-gray-50 rounded-lg shadow-lg p-4 max-w-xs w-full transform transition-transform duration-300 hover:scale-105 z-50 border border-gray-200">
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-sm font-semibold text-gray-900">Quick Price Info</h4>
      <span className="text-xs text-gray-700">Today</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-800">Single Egg:</span>
        <span className="font-bold text-gray-900">₹{formatPrice(todayRate)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-800">Tray (30):</span>
        <span className="font-bold text-gray-900">₹{formatPrice(trayPrice)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-800">Weekly Change:</span>
        <span className={`font-bold ${weeklyChange > 0 ? 'text-green-700' : weeklyChange < 0 ? 'text-red-700' : 'text-gray-700'}`}>
          {weeklyChange !== 'N/A' && (weeklyChange > 0 ? '+' : '')}{weeklyChange}
          <span className="text-xs ml-1">({weeklyChangePercent}%)</span>
        </span>
      </div>
    </div>
  </div>
);

export default QuickInfo;
