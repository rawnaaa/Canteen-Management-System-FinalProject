import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [restockData, setRestockData] = useState({
    quantity: 0,
    reason: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (item) => {
    try {
      await api.patch(`/menu/${item.id}/stock`, {
        quantity: restockData.quantity,
        reason: restockData.reason
      });
      
      toast.success('Stock updated successfully');
      fetchInventory();
      setEditingItem(null);
      setRestockData({ quantity: 0, reason: '' });
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleBulkRestock = async () => {
    const lowStockItems = inventory.filter(item => item.stock_quantity <= item.low_stock_threshold);
    
    if (lowStockItems.length === 0) {
      toast.info('No low stock items to restock');
      return;
    }

    try {
      const items = lowStockItems.map(item => ({
        menu_item_id: item.id,
        quantity: 20 // Restock to 20
      }));

      await api.post('/inventory/bulk-restock', {
        items,
        reason: 'Bulk restock - low stock items'
      });

      toast.success(`Restocked ${lowStockItems.length} items`);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to bulk restock');
    }
  };

  const getStockStatus = (item) => {
    if (item.stock_quantity <= 0) return 'out';
    if (item.stock_quantity <= item.low_stock_threshold) return 'low';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'out': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={handleBulkRestock}
          className="btn-primary flex items-center gap-2"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Bulk Restock Low Items
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const status = getStockStatus(item);
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.stock_quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.low_stock_threshold}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                      {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingItem === item.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={restockData.quantity}
                          onChange={(e) => setRestockData({ ...restockData, quantity: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="Qty"
                        />
                        <input
                          type="text"
                          value={restockData.reason}
                          onChange={(e) => setRestockData({ ...restockData, reason: e.target.value })}
                          className="w-32 px-2 py-1 border rounded"
                          placeholder="Reason"
                        />
                        <button
                          onClick={() => handleUpdateStock(item)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;