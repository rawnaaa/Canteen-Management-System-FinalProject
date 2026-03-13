import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function MenuForm({ item, categories, onClose, onSaved }) {
  const isEdit = Boolean(item)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    is_available: true,
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category_id: item.category_id || '',
        stock_quantity: item.stock_quantity || '',
        low_stock_threshold: item.low_stock_threshold || '10',
        is_available: item.is_available ?? true,
        image: null,
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }))
    setErrors((err) => ({ ...err, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          if (k === 'is_available') formData.append(k, v ? '1' : '0')
          else formData.append(k, v)
        }
      })

      if (isEdit) {
        await api.post(`/menu/${item.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Menu item updated!')
      } else {
        await api.post('/menu', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Menu item created!')
      }
      onSaved()
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(err.response?.data?.message || 'Save failed.')
      }
    } finally {
      setSaving(false)
    }
  }

  const field = (label, name, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={type !== 'file' ? form[name] : undefined}
        onChange={handleChange}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400
          ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
        {...extra}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field('Name', 'name', 'text', { required: true })}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400
                ${errors.category_id ? 'border-red-400' : 'border-gray-300'}`}
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Price (₱)', 'price', 'number', { step: '0.01', min: '0', required: true })}
            {field('Stock Quantity', 'stock_quantity', 'number', { min: '0', required: true })}
          </div>

          {field('Low Stock Threshold', 'low_stock_threshold', 'number', { min: '0' })}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-orange-700 file:font-medium hover:file:bg-orange-100"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_available"
              checked={form.is_available}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            <span className="text-sm font-medium text-gray-700">Available for ordering</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}