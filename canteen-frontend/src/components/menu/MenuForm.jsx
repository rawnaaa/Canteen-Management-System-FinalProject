import React, { useState } from 'react';

const MenuForm = ({ onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        price: initialData.price || '',
        category_id: initialData.category_id || 1
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Item Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            <button type="submit" style={{ background: '#4e73df', color: 'white', border: 'none', padding: '10px' }}>Save Item</button>
        </form>
    );
};

export default MenuForm;