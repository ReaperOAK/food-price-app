import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register only needed ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip
);

// Basic chart defaults
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  font: {
    family: 'system-ui, -apple-system, sans-serif'
  }
};

const PriceChart = ({ 
  data = [], 
  title = 'Price Chart',
  type = 'bar', // 'bar' or 'line'
  xKey = 'city',
  yKey = 'rate',
  isLoading = false
}) => {
  // Loading state component
  if (isLoading) {
    return (
      <div className="animate-pulse w-full h-[350px] bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Loading chart...</span>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[350px] bg-white rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No data available</span>
      </div>
    );
  }

  // Format date if xKey is 'date'
  const formatLabel = (value) => {
    if (xKey === 'date' && value) {
      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return value;
  };

  // Prepare chart data
  const chartData = {
    labels: data.map(item => formatLabel(item[xKey])),
    datasets: [{
      label: title,
      data: data.map(item => item[yKey]),
      backgroundColor: type === 'line' ? 'rgb(59, 130, 246)' : 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: type === 'line' ? 2 : 1,
      tension: type === 'line' ? 0.3 : 0,
      pointRadius: type === 'line' ? 3 : 0,
      fill: type !== 'line'
    }]
  };

  // Chart options
  const options = {
    ...chartDefaults,
    plugins: {
      title: {
        display: true,
        text: title,
        padding: 20,
        color: '#1f2937'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`
        }
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => `₹${Number(value).toFixed(2)}`,
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: type === 'line' ? 45 : 0,
          color: '#6b7280'
        }
      }
    }
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="w-full h-[350px] bg-white p-4 rounded-lg shadow">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default React.memo(PriceChart);
