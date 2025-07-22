import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TrackOrders.css';

const TrackOrders = () => {
  const { token, role } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/orders/user-orders`;
      console.log('Fetching orders with token:', token);
      console.log('User role:', role);
      console.log('Calling URL:', url);
      console.log('Token length:', token ? token.length : 0);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Orders data:', data);
        setOrders(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        setError(`Failed to fetch orders: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#fbbf24'; // yellow
      case 'confirmed':
        return '#10b981'; // green
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="track-orders-container">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="track-orders-container">
      <div className="track-orders-content">
        <div className="header">
          <h1>Track My Orders</h1>
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
              </svg>
            </div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Customer:</span>
                    <span className="value">{order.customerName}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value amount">${order.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">{order.paymentMethod}</span>
                  </div>
                  
                  {order.transactionId && (
                    <div className="detail-row">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{order.transactionId}</span>
                    </div>
                  )}
                </div>

                <div className="order-items">
                  <h4>Order Items:</h4>
                  <div className="items-list">
                    {order.cartItems.map((item, index) => (
                      <div key={index} className="item">
                        <div className="item-image">
                          {item.productId && item.productId.image ? (
                            <img 
                              src={item.productId.image} 
                              alt={item.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="placeholder-image">📦</div>
                          )}
                        </div>
                        <div className="item-details">
                          <h5>{item.name}</h5>
                          <p>Quantity: {item.qty}</p>
                          <p>Price: ${item.price}</p>
                        </div>
                        <div className="item-total">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="delivery-info">
                    <h4>Delivery Address:</h4>
                    <p>{order.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrders; 