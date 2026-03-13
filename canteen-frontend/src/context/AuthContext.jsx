import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('canteen_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('canteen_token')
    if (token) {
      authService
        .me()
        .then(({ data }) => {
          setUser(data)
          localStorage.setItem('canteen_user', JSON.stringify(data))
        })
        .catch(() => {
          localStorage.removeItem('canteen_token')
          localStorage.removeItem('canteen_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login(email, password)
    localStorage.setItem('canteen_token', data.access_token)
    localStorage.setItem('canteen_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // silent
    } finally {
      localStorage.removeItem('canteen_token')
      localStorage.removeItem('canteen_user')
      setUser(null)
    }
  }, [])

  const isAdmin    = user?.role === 'admin'
  const isCashier  = user?.role === 'cashier'
  const isCustomer = user?.role === 'customer'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isCashier, isCustomer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}