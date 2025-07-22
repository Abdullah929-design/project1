import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminOrders.css';

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(orders.map(order => 
          order._id === orderId ? result.order : order
        ));
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
      } else {
        setError('Failed to delete order');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'confirmed':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="header">
        <h2>Orders Management</h2>
        <div className="stats">
          <span>Total Orders: {orders.length}</span>
          <span>Pending: {orders.filter(o => o.status === 'pending').length}</span>
          <span>Confirmed: {orders.filter(o => o.status === 'confirmed').length}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id">{order._id.slice(-8)}</span>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName}</div>
                      <div className="customer-email">{order.email}</div>
                    </div>
                  </td>
                  <td>{order.contactNumber}</td>
                  <td>
                    <div className="items-summary">
                      {order.cartItems.length} item(s)
                      <button 
                        className="btn-view-items"
                        onClick={() => viewOrderDetails(order)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                  <td className="amount">${order.amount}</td>
                  <td>
                    <div className="payment-info">
                      <span className="payment-method">{order.paymentMethod}</span>
                      {order.transactionId && (
                        <span className="transaction-id">ID: {order.transactionId}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="status-select"
                      style={{ borderColor: getStatusColor(order.status) }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn-view"
                        onClick={() => viewOrderDetails(order)}
                      >
                        View
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(order._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedOrder.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact:</span>
                    <span className="value">{selectedOrder.contactNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">{selectedOrder.address}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Order Information</h4>
                  <div className="detail-item">
                    <span className="label">Order ID:</span>
                    <span className="value">{selectedOrder._id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value" style={{ color: getStatusColor(selectedOrder.status) }}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="value">${selectedOrder.amount}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Payment Information</h4>
                  <div className="detail-item">
                    <span className="label">Method:</span>
                    <span className="value">{selectedOrder.paymentMethod}</span>
                  </div>
                  {selectedOrder.transactionId && (
                    <div className="detail-item">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{selectedOrder.transactionId}</span>
                    </div>
                  )}
                  {selectedOrder.paymentProof && (
                    <div className="detail-item">
                      <span className="label">Payment Proof:</span>
                      <div className="payment-proof">
                        <img 
                          src={
                            selectedOrder.paymentProof.startsWith('http')
                              ? selectedOrder.paymentProof
                              : `http://localhost:5000${selectedOrder.paymentProof}`
                          }
                          alt="Payment Proof" 
                          className="proof-image"
                        />
                        <a 
                          href={
                            selectedOrder.paymentProof.startsWith('http')
                              ? selectedOrder.paymentProof
                              : `http://localhost:5000${selectedOrder.paymentProof}`
                          }
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-download"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="items-section">
                <h4>Order Items</h4>
                <div className="items-list">
                  {selectedOrder.cartItems.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-info">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 