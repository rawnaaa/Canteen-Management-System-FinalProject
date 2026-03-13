import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

// Pages
import Login from './components/auth/Login'
import AdminDashboard from './components/dashboard/AdminDashboard'
import MenuList from './components/menu/MenuList'
import POSInterface from './components/orders/POSInterface'
import OrderQueue from './components/orders/OrderQueue'
import MyOrders from './components/orders/MyOrders'
import Cart from './components/orders/Cart'
import InventoryTable from './components/inventory/InventoryTable'
import UserManagement from './components/users/UserManagement'

// Lazy report page (inline to keep single file)
import SalesChart from './components/dashboard/SalesChart'
import CategoryPieChart from './components/dashboard/CategoryPieChart'
import OrderTrendChart from './components/dashboard/OrderTrendChart'

function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
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

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-500">You don't have permission to view this page.</p>
    </div>
  )
}

function DefaultRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner size="lg" />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  if (user.role === 'cashier') return <Navigate to="/pos" replace />
  return <Navigate to="/menu" replace />
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<DefaultRedirect />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/reports"   element={<ReportsPage />} />
                <Route path="/users"     element={<UserManagement />} />
              </Route>

              {/* Admin + Cashier */}
              <Route element={<ProtectedRoute roles={['admin', 'cashier']} />}>
                <Route path="/pos"       element={<POSInterface />} />
                <Route path="/orders"    element={<OrderQueue />} />
                <Route path="/inventory" element={<InventoryTable />} />
              </Route>

              {/* All authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/menu" element={<MenuList />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontSize: '14px' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner size="lg" />
  if (user) return <Navigate to="/" replace />
  return children
}
