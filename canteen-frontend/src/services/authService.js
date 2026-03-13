import api from './api'

const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async register(name, email, password, password_confirmation, role = 'customer') {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      password_confirmation,
      role,
    })
    return data
  },

  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },

  async logout() {
    const { data } = await api.post('/auth/logout')
    return data
  },
}

export default authService