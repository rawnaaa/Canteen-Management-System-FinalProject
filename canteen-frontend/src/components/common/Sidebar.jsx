import React from 'react';

const Sidebar = ({ setView, currentView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'pos', label: 'POS / Ordering', icon: '🛒' },
        { id: 'inventory', label: 'Inventory', icon: '📦' },
        { id: 'menu', label: 'Menu Management', icon: '📋' }
    ];

    return (
        <div style={sidebarStyle}>
            <h3 style={{ textAlign: 'center', color: 'white' }}>CMS Admin</h3>
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            {menuItems.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => setView(item.id)}
                    style={navItemStyle(currentView === item.id)}
                >
                    <span style={{ marginRight: '10px' }}>{item.icon}</span>
                    {item.label}
                </div>
            ))}
        </div>
    );
};

const sidebarStyle = { width: '240px', backgroundColor: '#4e73df', minHeight: '100vh', padding: '20px', color: 'white' };
const navItemStyle = (active) => ({
    padding: '12px 15px', borderRadius: '5px', cursor: 'pointer', marginBottom: '5px',
    backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
    fontWeight: active ? 'bold' : 'normal', transition: '0.3s'
});

export default Sidebar;