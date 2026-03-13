import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SalesChart from './SalesChart';
import CategoryPieChart from './CategoryPieChart';
import OrderTrendChart from './OrderTrendChart';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    overall: {
      total_revenue: 0,
      total_orders: 0,
      average_order_value: 0
    },
    low_stock: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/summary', { params: dateRange });
      console.log('Summary data:', response.data); // Debug log
      
      // Ensure we have the expected data structure
      setSummary({
        overall: {
          total_revenue: response.data?.overall?.total_revenue || 0,
          total_orders: response.data?.overall?.total_orders || 0,
          average_order_value: response.data?.overall?.average_order_value || 0
        },
        low_stock: response.data?.low_stock || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Format number to fixed decimal safely
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={dateRange.start_date}
              onChange={handleDateRangeChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={dateRange.end_date}
              onChange={handleDateRangeChange}
              className="input-field"
            />
          </div>
          <button
            onClick={fetchSummary}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            ${formatCurrency(summary.overall.total_revenue)}
          </h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {summary.overall.total_orders}
          </h3>
          <p className="text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-lg p-3">
              <CubeIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {summary.low_stock}
          </h3>
          <p className="text-gray-600">Low Stock Items</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Overview</h2>
          <SalesChart dateRange={dateRange} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <CategoryPieChart dateRange={dateRange} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Trends (Last 30 Days)</h2>
        <OrderTrendChart days={30} />
      </div>
    </div>
  );
};

export default AdminDashboard;