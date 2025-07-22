import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartDebug = () => {
  const { items, total, loading, error } = useCart();
  const { token, isAuthenticated } = useAuth();

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h4>Cart Debug</h4>
      <div>Auth: {isAuthenticated() ? 'Yes' : 'No'}</div>
      <div>Token: {token ? 'Present' : 'None'}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Items: {items.length}</div>
      <div>Total: ${total}</div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};

export default CartDebug; 