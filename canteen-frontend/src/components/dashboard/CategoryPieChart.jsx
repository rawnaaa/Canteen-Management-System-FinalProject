import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryPieChart = ({ dateRange }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, [dateRange]);

  const fetchCategoryData = async () => {
    try {
      const response = await api.get('/reports/category-breakdown', { params: dateRange });
      const data = response.data || [];

      const colors = [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ];

      setChartData({
        labels: data.map(item => item.name || 'Unknown'),
        datasets: [
          {
            data: data.map(item => Number(item.total_revenue) || 0),
            backgroundColor: colors.slice(0, data.length),
            borderColor: colors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
          }
        ]
      });
    } catch (error) {
      console.error('Failed to load category data:', error);
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: $${Number(value).toFixed(2)}`;
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
        <Pie data={chartData} options={options} />
      ) : (
        <div className="flex justify-center items-center h-full text-gray-500">
          No data available for selected period
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;