import { formatPrice } from '../../utils/formatters';

const PriceTrendsWidget = ({ today, todayRate, rate7DaysAgo }) => {
  return (
    <div className="p-6 mt-6 bg-white shadow-lg rounded-lg transform transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">Price Trends</span>
        <span className="text-sm font-normal text-gray-500">Last 30 days</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800">Today's Rate</h3>
            <span className="text-xs text-gray-500">{today}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(todayRate)}</p>
          <p className="text-sm text-gray-600 mt-1">Per egg</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800">7 Days Ago</h3>
            <span className="text-xs text-gray-500">
              {new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString()}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{formatPrice(rate7DaysAgo)}</p>
          <p className="text-sm text-gray-600 mt-1">Per egg</p>
        </div>
      </div>
    </div>
  );
};

export default PriceTrendsWidget;
