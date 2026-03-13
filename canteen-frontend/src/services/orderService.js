import api from './api';

class OrderService {
  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  }

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  async updateOrderStatus(id, status) {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }

  async getOrderQueue() {
    const response = await api.get('/queue/orders');
    return response.data;
  }

  async getMyOrders() {
    const response = await api.get('/my-orders');
    return response.data;
  }
}

export default new OrderService();