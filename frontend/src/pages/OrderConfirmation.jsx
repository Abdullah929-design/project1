import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, customerName, amount } = location.state || {};

  // Redirect if no order data
  if (!orderId) {
    navigate('/');
    return null;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-content">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        
        <h1>Thank You!</h1>
        <h2>Your order has been placed successfully. Our team will review your order and send you an email once it is approved.</h2>
        
        <div className="order-details">
          <div className="detail-item">
            <span className="label">Order ID:</span>
            <span className="value">{orderId}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Customer Name:</span>
            <span className="value">{customerName}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Total Amount:</span>
            <span className="value">${amount}</span>
          </div>
          
          <div className="detail-item">
            <span className="label">Status:</span>
            <span className="value status-pending">Pending</span>
          </div>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>We'll review your order and payment details</li>
            <li>You'll receive a confirmation email shortly</li>
            <li>Our team will process your order within 24 hours</li>
            <li>We'll contact you if we need any additional information</li>
          </ul>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => navigate('/track-orders')}
          >
            Track My Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 