import React, { Suspense, lazy, useEffect } from 'react';

// Dynamically import Chart.js
import Chart from 'chart.js/auto';

const LoadingChart = () => (
  <div className="animate-pulse w-full h-[350px] flex flex-col items-center justify-center bg-white rounded-lg">
    <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
    <div className="w-full h-[250px] bg-gray-100 rounded"></div>
  </div>
);

const RateChart = ({ data = [], title = 'Egg Rates', chartType = 'bar', xAxisKey = 'city', yAxisKey = 'rate', showLine = false, isLoading = false }) => {
  const containerStyle = {
    position: 'relative',
    height: '350px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  };

  // Initialize Chart.js on mount
  useEffect(() => {
    const initChart = async () => {
      const { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } = await import('chart.js');
      Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);
    };
    initChart();
  }, []);

  // Use React.lazy for chart components
  const Bar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
  const Line = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));


  if (isLoading) {
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
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: showLine ? 2 : 1,
      fill: showLine ? 'start' : undefined,
      tension: showLine ? 0.3 : undefined,
      pointRadius: showLine ? 4 : undefined,
      pointHoverRadius: showLine ? 6 : undefined,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: 'rgb(59, 130, 246)',
      pointBorderWidth: 2
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: title,
        color: '#1f2937',
        font: {
          size: 14,
          weight: '600',
          family: "'Inter', system-ui, sans-serif"
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        titleFont: {
          weight: '600',
          family: "'Inter', system-ui, sans-serif"
        },
        bodyFont: {
          family: "'Inter', system-ui, sans-serif"
        },
        padding: 12,
        boxPadding: 6,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context) => `₹${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        border: {
          display: false
        },
        ticks: {
          callback: (value) => `₹${value.toFixed(2)}`,
          font: {
            family: "'Inter', system-ui, sans-serif",
            size: 11
          },
          padding: 8
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
          font: {
            family: "'Inter', system-ui, sans-serif",
            size: 11
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 10
      }
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="mt-4 bg-white" style={containerStyle}>
      <Suspense fallback={<LoadingChart />}>
        <ChartComponent data={chartData} options={options} />
      </Suspense>
    </div>
  );
};

export default RateChart;
