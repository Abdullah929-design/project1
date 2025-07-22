import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './AddToCartButton.css';

const AddToCartButton = ({ product, className = '' }) => {
  const { addToCart, loading, error, items } = useCart();
  const { token, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      alert('Please login to add items to your cart');
      return;
    }
    if (quantity > product.quantity) {
      setStockError('Limited stock available.');
      return;
    }
    setStockError('');
    setLocalLoading(true);
    try {
      await addToCart(product._id, quantity);
      setShowQuantity(false);
      setQuantity(1);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!isAuthenticated()) {
      alert('Please login to add items to your cart');
      return;
    }
    if (product.quantity < 1) {
      setStockError('Limited stock available.');
      return;
    }
    setStockError('');
    setLocalLoading(true);
    try {
      await addToCart(product._id, 1);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Reset local loading when global loading changes or cart items change
  useEffect(() => {
    if (!loading) {
      setLocalLoading(false);
    }
  }, [loading, items]);

  // Debug logging
  useEffect(() => {
    console.log(`AddToCartButton for ${product.name}:`, {
      authenticated: isAuthenticated(),
      globalLoading: loading,
      localLoading,
      productQuantity: product.quantity,
      cartItemsCount: items.length,
      showQuantityButton: product.quantity > 1
    });
  }, [loading, localLoading, product.quantity, items.length, product.name, isAuthenticated]);

  return (
    <div className={`add-to-cart-container ${className}`}>
      {showQuantity ? (
        <div className="quantity-selector">
          <div className="quantity-controls">
            <button 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="quantity-btn"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
            <button 
              onClick={incrementQuantity}
              disabled={quantity >= product.quantity}
              className="quantity-btn"
            >
              +
            </button>
          </div>
          <div className="quantity-actions">
            <button 
              onClick={handleAddToCart}
              disabled={localLoading}
              className="add-btn"
            >
              {localLoading ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              onClick={() => setShowQuantity(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
          {stockError && (
            <div className="error-message">{stockError}</div>
          )}
        </div>
      ) : (
        <div className="cart-actions">
          <button 
            onClick={handleQuickAdd}
            disabled={localLoading || product.quantity === 0}
            className="quick-add-btn"
          >
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {product.quantity > 1 && (
            <button 
              onClick={() => setShowQuantity(true)}
              className="quantity-select-btn"
              type="button"
            >
              Select Quantity
            </button>
          )}
          {stockError && (
            <div className="error-message">{stockError}</div>
          )}
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddToCartButton; 