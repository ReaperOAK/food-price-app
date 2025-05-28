import React, { useState, useEffect } from 'react';

// Minimal chart initialization with only required components
const loadChart = async (type) => {
  const { Chart: ChartJS } = await import(/* webpackChunkName: "chart-core-min" */ 'chart.js/auto');
  
  // Configure defaults globally to reduce bundle size
  ChartJS.defaults.responsive = true;
  ChartJS.defaults.maintainAspectRatio = false;
  ChartJS.defaults.plugins.tooltip = {
    enabled: true,
    position: 'nearest',
    backgroundColor: '#fff',
    titleColor: '#1f2937',
    bodyColor: '#1f2937',
    padding: 12,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1
  };
  ChartJS.defaults.scale = {
    grid: {
      color: 'rgba(0, 0, 0, 0.05)'
    }
  };
  
  // Ensure proper event handling
  ChartJS.defaults.plugins.legend = {
    position: 'top',
    labels: {
      boxWidth: 20,
      padding: 20
    }
  };

  // Only load the required chart type
  if (type === 'line') {
    const { Line } = await import(/* webpackChunkName: "chart-line" */ 'react-chartjs-2');
    return Line;
  }
  const { Bar } = await import(/* webpackChunkName: "chart-bar" */ 'react-chartjs-2');
  return Bar;
};

const LoadingChart = () => (
  <div className="animate-pulse w-full h-[350px] flex flex-col items-center justify-center bg-white rounded-lg">
    <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
    <div className="w-full h-[250px] bg-gray-100 rounded"></div>
  </div>
);

const RateChart = ({ 
  data = [], 
  title = 'Egg Rates', 
  chartType = 'bar', 
  xAxisKey = 'city', 
  yAxisKey = 'rate', 
  showLine = false, 
  isLoading = false 
}) => {
  const [ChartComponent, setChartComponent] = useState(null);

  useEffect(() => {
    if (!isLoading && data?.length > 0) {
      loadChart(chartType).then(setChartComponent);
    }
  }, [chartType, isLoading, data]);

  const containerStyle = {
    position: 'relative',
    height: '350px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };

  if (isLoading || !ChartComponent) {
    return <LoadingChart />;
  }

  if (!data || data.length === 0) {
    return (
      <div style={containerStyle} className="mt-4">
        <div className="text-gray-500 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr || xAxisKey !== 'date') return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  const chartData = {
    labels: data.map(item => formatDate(item[xAxisKey])),
    datasets: [{
      label: title,
      data: data.map(item => item[yAxisKey]),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: showLine ? 'rgb(59, 130, 246)' : 'rgb(59, 130, 246)',
      borderWidth: showLine ? 2 : 1,
      tension: showLine ? 0.3 : 0,
      pointRadius: showLine ? 4 : 0,
      fill: !showLine,
      order: 1
    }]
  };
  const options = {
    plugins: {
      title: {
        display: true,
        text: title,
        color: '#1f2937',
        font: {
          size: 14,
          weight: '600'
        },
        padding: 20
      },
      tooltip: {
        enabled: true,
        position: 'nearest',
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`
        }
      },
      legend: {
        display: true,
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 20,
          padding: 20,
          color: '#1f2937',
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `₹${value.toFixed(2)}`,
          font: { size: 11 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 11 }
        }
      }
    }
  };

  return (
    <div className="mt-4 bg-white" style={containerStyle}>
      {ChartComponent && (
        <ChartComponent 
          data={chartData} 
          options={options} 
        />
      )}
    </div>
  );
};

export default React.memo(RateChart);
