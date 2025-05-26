import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const RateChart = ({ data = [], title = 'Egg Rates', chartType = 'bar', xAxisKey = 'city', yAxisKey = 'rate', showLine = false }) => {
  if (!data || data.length === 0) {
    return null;
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
      },
      title: {
        display: true,
        text: title,
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
          }
        }
      }
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="mt-8" style={{ position: 'relative', height: '400px', width: '100%' }}>
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default RateChart;
