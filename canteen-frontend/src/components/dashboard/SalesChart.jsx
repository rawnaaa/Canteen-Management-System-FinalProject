import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Sales Revenue',
      data: [],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    try {
      const response = await api.get('/reports/daily-sales', { params: dateRange });
      const data = response.data?.data || [];

      setChartData({
        labels: data.map(item => item.date || ''),
        datasets: [
          {
            label: 'Sales Revenue',
            data: data.map(item => Number(item.total_sales) || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load sales data:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.raw || 0;
            return `${label}: $${Number(value).toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      {chartData.labels.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="flex justify-center items-center h-full text-gray-500">
          No data available for selected period
        </div>
      )}
    </div>
  );
};

export default SalesChart;