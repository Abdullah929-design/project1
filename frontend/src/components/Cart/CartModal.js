import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartModal.css';

const CartModal = ({ isOpen, onClose }) => {
  const { 
    items, 
    total, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    clearError 
  } = useCart();

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    onClose(); // Close the cart modal
    navigate('/checkout'); // Navigate to checkout page
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Shopping Cart</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError} className="error-close">×</button>
          </div>
        )}

        {loading && (
          <div className="loading-message">Loading cart...</div>
        )}

        {items.length === 0 ? (
          <div className="empty-cart">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Your cart is empty</p>
            <button onClick={onClose} className="continue-shopping">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.product._id} className="cart-item">
                  <div className="item-image">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p className="item-price">${item.price}</p>
                    <p className="item-description">{item.product.description}</p>
                  </div>

                  <div className="item-quantity">
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product._id)}
                    className="remove-btn"
                    title="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button onClick={handleClearCart} className="clear-cart-btn">
                  Clear Cart
                </button>
                <button onClick={handleCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal; 