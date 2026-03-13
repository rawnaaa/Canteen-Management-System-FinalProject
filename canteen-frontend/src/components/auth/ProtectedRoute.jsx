import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * Usage:
 *   <ProtectedRoute />                    — any authenticated user
 *   <ProtectedRoute roles={['admin']} />  — admin only
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner size="lg" text="Loading…" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}