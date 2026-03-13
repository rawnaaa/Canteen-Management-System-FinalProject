import api from './api'

const orderService = {
  async getAll(params = {}) {
    const { data } = await api.get('/orders', { params })
    return data
  },

  async getOne(id) {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await api.post('/orders', payload)
    return data
  },

  async updateStatus(id, status) {
    const { data } = await api.patch(`/orders/${id}/status`, { status })
    return data
  },

  async destroy(id) {
    const { data } = await api.delete(`/orders/${id}`)
    return data
  },
}

export default orderService