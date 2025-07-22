import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, total, clearCart } = useContext(CartContext);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    address: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!items || items.length === 0) {
      navigate('/');
      return;
    }
  }, [token, items, navigate]);

  // Fetch payment method details when selected
  useEffect(() => {
    if (paymentMethod && paymentMethod !== 'COD') {
      fetchPaymentMethodDetails();
    } else {
      setPaymentDetails(null);
    }
  }, [paymentMethod]);

  const fetchPaymentMethodDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/payment-methods/${paymentMethod}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);
      } else {
        setError('Payment method details not found');
      }
    } catch (error) {
      setError('Failed to fetch payment method details');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setPaymentProof(e.target.files[0]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Account number copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.customerName || !formData.contactNumber || !formData.email || !formData.address) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      setLoading(false);
      return;
    }

    if (paymentMethod !== 'COD' && !transactionId) {
      setError('Please enter transaction ID');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      // Format cart items for the order
      const formattedCartItems = items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        qty: item.quantity
      }));
      formDataToSend.append('cartItems', JSON.stringify(formattedCartItems));
      formDataToSend.append('amount', total);
      formDataToSend.append('paymentMethod', paymentMethod);
      
      if (transactionId) {
        formDataToSend.append('transactionId', transactionId);
      }
      
      if (paymentProof) {
        formDataToSend.append('paymentProof', paymentProof);
      }

      console.log('Submitting order with token:', token);
      console.log('Form data:', {
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        cartItems: formattedCartItems,
        amount: total,
        paymentMethod: paymentMethod,
        transactionId: transactionId
      });

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Order creation response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Order created successfully:', result);
        clearCart();
        navigate('/order-confirmation', { 
          state: { 
            orderId: result.order.id,
            customerName: result.order.customerName,
            amount: result.order.amount
          }
        });
      } else {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        if (errorData.message && errorData.message.includes('Insufficient stock')) {
          setError(errorData.message);
        } else {
          setError(errorData.message || 'Failed to place order');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1>Checkout</h1>
        {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}
        <div className="checkout-grid">
          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-items">
              {items.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="total-section">
              <h3>Total: ${total.toFixed(2)}</h3>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <h2>Customer Details</h2>
              
              <div className="form-group">
                <label htmlFor="customerName">Full Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                />
              </div>

              <h2>Payment Method</h2>
              <div className="payment-options">
                <div className="payment-option">
                  <input
                    type="radio"
                    id="jazzcash"
                    name="paymentMethod"
                    value="JazzCash"
                    checked={paymentMethod === 'JazzCash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="jazzcash">JazzCash</label>
                </div>

                <div className="payment-option">
                  <input
                    type="radio"
                    id="easypaisa"
                    name="paymentMethod"
                    value="EasyPaisa"
                    checked={paymentMethod === 'EasyPaisa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="easypaisa">EasyPaisa</label>
                </div>

                <div className="payment-option">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label htmlFor="cod">Cash on Delivery (COD)</label>
                </div>
              </div>

              {/* Payment Details */}
              {paymentDetails && (
                <div className="payment-details">
                  <h3>{paymentMethod} Payment Details</h3>
                  
                  <div className="account-info">
                    <div className="account-detail">
                      <label>Account Title:</label>
                      <span>{paymentDetails.accountTitle}</span>
                    </div>
                    
                    <div className="account-detail">
                      <label>Account Number:</label>
                      <div className="account-number-container">
                        <span>{paymentDetails.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentDetails.accountNumber)}
                          className="copy-btn"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {paymentDetails.qrCodeUrl && (
                    <div className="qr-code-section">
                      <label>QR Code:</label>
                      <img 
                        src={paymentDetails.qrCodeUrl} 
                        alt="QR Code" 
                        className="qr-code"
                      />
                      <p className="qr-caption">Scan to Pay</p>
                    </div>
                  )}

                  <div className="payment-instructions">
                    <label>Instructions:</label>
                    <p>{paymentDetails.instructions}</p>
                  </div>

                  <div className="amount-to-pay">
                    <h4>Amount to Pay: ${total.toFixed(2)}</h4>
                  </div>

                  <div className="form-group">
                    <label htmlFor="transactionId">Transaction ID *</label>
                    <input
                      type="text"
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentProof">Payment Proof (Screenshot) *</label>
                    <input
                      type="file"
                      id="paymentProof"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 