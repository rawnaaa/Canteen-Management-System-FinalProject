import React from 'react';

const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <div className="spinner" style={{
            width: '40px', height: '40px', border: '4px solid #f3f3f3',
            borderTop: '4px solid #4e73df', borderRadius: '50%', animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

export default LoadingSpinner;