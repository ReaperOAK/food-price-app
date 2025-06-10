import React, { useState, useEffect } from 'react';
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

// Enhanced chart defaults
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  font: {
    family: 'system-ui, -apple-system, sans-serif'
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  elements: {
    point: {
      hoverRadius: 6,
      hoverBorderWidth: 2
    }
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
  const [chartHeight, setChartHeight] = useState(window.innerWidth < 640 ? 300 : 350);

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerWidth < 640 ? 300 : 350);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Loading state component
  if (isLoading) {
    return (
      <div className="animate-pulse w-full h-[350px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm transition-shadow duration-300" role="status" aria-label="Loading chart data">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Loading chart...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data?.length === 0) {
    return (
      <div className="w-full h-[350px] bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm text-center p-4 border border-gray-100 dark:border-gray-700" role="alert" aria-label="No data available">
        <div className="flex flex-col items-center space-y-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span className="text-gray-500 dark:text-gray-400 font-medium">No data available</span>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for updates</p>
        </div>
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
  // Enhanced chart data with gradients and animations
  const chartData = {
    labels: data.map(item => formatLabel(item[xKey])),
    datasets: [{
      label: title,
      data: data.map(item => item[yKey]),
      backgroundColor: (context) => {
        if (type === 'line') {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgb(59, 130, 246)';
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');
          return gradient;
        }
        return 'rgba(59, 130, 246, 0.7)';
      },
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: type === 'line' ? 2.5 : 1,
      tension: type === 'line' ? 0.4 : 0,
      pointRadius: type === 'line' ? 4 : 0,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: 'rgb(59, 130, 246)',
      pointBorderWidth: 2,
      fill: true,
      hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
      hoverBorderColor: 'rgb(37, 99, 235)',
      hoverBorderWidth: 2
    }]
  };
  // Enhanced chart options
  const options = {
    ...chartDefaults,
    plugins: {
      title: {
        display: true,
        text: title,
        padding: 20,
        font: {
          size: 16,
          weight: '600',
          family: 'system-ui, -apple-system, sans-serif',
        },
        color: '#1f2937'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context) => {
            const value = context.raw.toFixed(2);
            return `₹${value} per piece`;
          },
          title: (context) => {
            const label = context[0].label;
            return xKey === 'date' ? `Date: ${label}` : `Market: ${label}`;
          }
        },
        animation: {
          duration: 150
        }
      },
      legend: {
        display: false
      }
    },    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 0.5
        },
        border: {
          display: false
        },
        ticks: {
          callback: (value) => `₹${Number(value).toFixed(2)}`,
          color: '#6b7280',
          font: {
            size: 11,
            family: 'system-ui, -apple-system, sans-serif'
          },
          padding: 8,
          maxTicksLimit: 8
        },
        afterFit: (scaleInstance) => {
          scaleInstance.width = 60; // Keeps Y axis width consistent
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          maxRotation: type === 'line' ? 45 : 0,
          minRotation: type === 'line' ? 45 : 0,
          color: '#6b7280',
          font: {
            size: 11,
            family: 'system-ui, -apple-system, sans-serif'
          },
          padding: 8,
          maxTicksLimit: type === 'line' ? 8 : 12,
          autoSkip: true
        }
      }
    }
  };

  const ChartComponent = type === 'line' ? Line : Bar;  return (
    <div 
      className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
      style={{
        height: `${chartHeight}px`,
        maxHeight: '500px'
      }}
    >
      <div className="w-full h-full" role="img" aria-label={`${title} visualization`}>
        <ChartComponent 
          data={chartData} 
          options={options}
          aria-label={`Chart showing ${title}`}
          role="presentation"
        />
      </div>
    </div>
  );
};

export default React.memo(PriceChart);
