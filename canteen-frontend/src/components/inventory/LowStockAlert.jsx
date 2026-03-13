import React from 'react';

const LowStockAlert = ({ items }) => {
    const lowStockItems = items.filter(i => i.stock_quantity < 10);
    if (lowStockItems.length === 0) return null;

    return (
        <div style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
            <strong>⚠️ Low Stock Warning:</strong> {lowStockItems.map(i => i.name).join(', ')} items are running low!
        </div>
    );
};

export default LowStockAlert;