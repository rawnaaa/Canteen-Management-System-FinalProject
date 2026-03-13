import { useState, useEffect } from 'react'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import SalesChart from './SalesChart'
import CategoryPieChart from './CategoryPieChart'
import OrderTrendChart from './OrderTrendChart'
import { TrendingUp, ShoppingBag, DollarSign, Star } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/sales-summary')
      .then(({ data }) => setSummary(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard…" />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Today's Sales"
          value={`₱${Number(summary?.daily_sales || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          color="bg-orange-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Sales"
          value={`₱${Number(summary?.monthly_sales || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          color="bg-blue-500"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={summary?.total_orders?.toLocaleString() || '0'}
          color="bg-green-500"
        />
        <StatCard
          icon={Star}
          label="Avg Order Value"
          value={`₱${Number(summary?.avg_order_value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Daily Sales (Last 30 Days)</h2>
          <SalesChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Sales by Category</h2>
          <CategoryPieChart />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Order Volume Trend (Last 30 Days)</h2>
        <OrderTrendChart />
      </div>
    </div>
  )
}