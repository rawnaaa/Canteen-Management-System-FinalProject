import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((err) => ({ ...err, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'admin') navigate('/dashboard')
      else if (user.role === 'cashier') navigate('/pos')
      else navigate('/menu')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(msg)
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  // Quick-fill demo credentials
  const fillDemo = (role) => {
    const creds = {
      admin:    { email: 'admin@canteen.com',   password: 'password' },
      cashier:  { email: 'cashier@canteen.com', password: 'password' },
      customer: { email: 'juan@student.edu',    password: 'password' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">Canteen Management</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Demo buttons */}
        <div className="flex gap-2 mb-6">
          {['admin', 'cashier', 'customer'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(role)}
              className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 capitalize transition"
            >
              {role}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mb-6">↑ Click to fill demo credentials</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-orange-400
                ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-orange-400
                ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-500 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}