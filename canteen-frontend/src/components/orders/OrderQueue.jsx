import React from 'react';

const OrderQueue = ({ orders }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3>Live Order Queue</h3>
        {orders.map(order => (
            <div key={order.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>Order #{order.order_number}</span>
                <span style={{ color: '#4e73df', fontWeight: 'bold' }}>{order.status}</span>
            </div>
        ))}
    </div>
);

export default OrderQueue;