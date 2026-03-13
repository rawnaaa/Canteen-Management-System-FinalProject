import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

export default function OrderTrendChart({ days = 30 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/order-trends', { params: { days } })
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <LoadingSpinner size="sm" />

  const formatted = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    total: d.total_orders,
    completed: d.completed_orders,
    cancelled: d.cancelled_orders,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total"     name="Total"     stroke="#f97316" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}