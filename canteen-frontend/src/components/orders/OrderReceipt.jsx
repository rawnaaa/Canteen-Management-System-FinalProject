import React from 'react';

const OrderReceipt = ({ order }) => (
    <div style={{ padding: '20px', border: '1px dashed #000', width: '300px', margin: '20px auto', textAlign: 'center', background: 'white' }}>
        <h4>CANTEEN RECEIPT</h4>
        <p>Order: {order.order_number}</p>
        <hr />
        <div style={{ textAlign: 'left' }}>
            {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name} x{item.pivot.quantity}</span>
                    <span>₱{(item.pivot.price * item.pivot.quantity).toFixed(2)}</span>
                </div>
            ))}
        </div>
        <hr />
        <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total:</span><span>₱{parseFloat(order.total_amount).toFixed(2)}</span>
        </h4>
        <p>Thank you for your purchase!</p>
    </div>
);

export default OrderReceipt;