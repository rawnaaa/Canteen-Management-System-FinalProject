import React, { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const MenuItemCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const imageUrl = item.image 
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${item.image}`
    : null;

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200 relative">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            <span className="text-4xl font-bold text-primary-600">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <span className="text-lg font-bold text-primary-600">
            ${parseFloat(item.price).toFixed(2)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
              disabled={!item.is_available}
            >
              -
            </button>
            <span className="px-3 py-1 text-gray-800">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
              disabled={!item.is_available}
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!item.is_available || item.stock_quantity < quantity}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Add
          </button>
        </div>

        {item.stock_quantity <= item.low_stock_threshold && item.stock_quantity > 0 && (
          <p className="mt-2 text-sm text-orange-600">
            Only {item.stock_quantity} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;