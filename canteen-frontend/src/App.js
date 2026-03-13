import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MenuList from './components/menu/MenuList';
import POSInterface from './components/orders/POSInterface';
import AdminDashboard from './components/dashboard/AdminDashboard';
import InventoryTable from './components/inventory/InventoryTable';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Navigate to="/menu" replace />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/menu"
                element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <MenuList />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pos"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                    <>
                      <Navbar />
                      <POSInterface />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <>
                      <Navbar />
                      <AdminDashboard />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <>
                      <Navbar />
                      <InventoryTable />
                    </>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;