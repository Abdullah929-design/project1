import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPaymentMethods.css';

const AdminPaymentMethods = () => {
  const { token } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    method: '',
    accountTitle: '',
    accountNumber: '',
    instructions: ''
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/payment-methods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      } else {
        setError('Failed to fetch payment methods');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setQrCodeFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      method: '',
      accountTitle: '',
      accountNumber: '',
      instructions: ''
    });
    setQrCodeFile(null);
    setEditingMethod(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.method || !formData.accountTitle || !formData.accountNumber || !formData.instructions) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!editingMethod && !qrCodeFile) {
      setError('QR code image is required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('method', formData.method);
      formDataToSend.append('accountTitle', formData.accountTitle);
      formDataToSend.append('accountNumber', formData.accountNumber);
      formDataToSend.append('instructions', formData.instructions);
      
      if (qrCodeFile) {
        formDataToSend.append('qrCode', qrCodeFile);
      }

      const url = editingMethod 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/payment-methods/${editingMethod._id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/payment-methods`;
      
      const method = editingMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        if (editingMethod) {
          setPaymentMethods(paymentMethods.map(method => 
            method._id === editingMethod._id ? result.paymentMethod : method
          ));
        } else {
          setPaymentMethods([result.paymentMethod, ...paymentMethods]);
        }
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save payment method');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method) => {
    setFormData({
      method: method.method,
      accountTitle: method.accountTitle,
      accountNumber: method.accountNumber,
      instructions: method.instructions
    });
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter(method => method._id !== id));
      } else {
        setError('Failed to delete payment method');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  if (loading && paymentMethods.length === 0) {
    return <div className="loading">Loading payment methods...</div>;
  }

  return (
    <div className="admin-payment-methods">
      <div className="header">
        <h2>Payment Methods Management</h2>
        <button 
          className="btn-add"
          onClick={() => setShowForm(true)}
        >
          Add Payment Method
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Payment Method Form */}
      {showForm && (
        <div className="form-container">
          <h3>{editingMethod ? 'Edit' : 'Add'} Payment Method</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="method">Payment Method *</label>
              <select
                id="method"
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Payment Method</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="accountTitle">Account Title *</label>
              <input
                type="text"
                id="accountTitle"
                name="accountTitle"
                value={formData.accountTitle}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="accountNumber">Account Number *</label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Payment Instructions *</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="qrCode">
                QR Code Image {!editingMethod && '*'}
              </label>
              <input
                type="file"
                id="qrCode"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingMethod}
              />
              {editingMethod && (
                <p className="help-text">
                  Leave empty to keep the existing QR code
                </p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : (editingMethod ? 'Update' : 'Add')}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="payment-methods-list">
        {paymentMethods.length === 0 ? (
          <div className="empty-state">
            <p>No payment methods found. Add your first payment method above.</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div key={method._id} className="payment-method-card">
              <div className="method-header">
                <h4>{method.method}</h4>
                <div className="method-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(method)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(method._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="method-details">
                <div className="detail-row">
                  <span className="label">Account Title:</span>
                  <span className="value">{method.accountTitle}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Account Number:</span>
                  <span className="value">{method.accountNumber}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Instructions:</span>
                  <span className="value">{method.instructions}</span>
                </div>

                {method.qrCodeUrl && (
                  <div className="qr-code-preview">
                    <span className="label">QR Code:</span>
                    <img 
                      src={method.qrCodeUrl} 
                      alt="QR Code" 
                      className="qr-code"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPaymentMethods; 