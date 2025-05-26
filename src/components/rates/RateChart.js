import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const RateChart = ({ data = [], title = 'Egg Rates', chartType = 'bar', xAxisKey = 'city', yAxisKey = 'rate', showLine = false, isLoading = false }) => {
  const containerStyle = {
    position: 'relative',
    minHeight: '400px',
    height: '400px',
    width: '100%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  if (isLoading) {
    return (
      <div style={containerStyle} className="mt-8">
        <div className="animate-pulse w-full h-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={containerStyle} className="mt-8">
        <div className="text-gray-500 text-center">
          <p>No data available</p>
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
    datasets: [
      {
        label: title,
        data: data.map(item => item[yAxisKey]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: showLine ? false : undefined,
        tension: showLine ? 0.3 : undefined,
        pointRadius: showLine ? 4 : undefined,
        pointHoverRadius: showLine ? 6 : undefined,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', system-ui, -apple-system, sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          family: "'Inter', system-ui, -apple-system, sans-serif",
          size: 14,
          weight: '600'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(2);
          },
          font: {
            family: "'Inter', system-ui, -apple-system, sans-serif",
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'Inter', system-ui, -apple-system, sans-serif",
            size: 12
          }
        }
      }
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="mt-8" style={containerStyle}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default RateChart;
