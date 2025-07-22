import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartIcon from './Cart/CartIcon';
import CartModal from './Cart/CartModal';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { token, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCartClick = () => {
    if (!token) {
      alert('Please login to view your cart');
      return;
    }
    setIsCartOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home with search query
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo and Brand */}
          <div className="navbar-brand">
            <Link to="/" className="navbar-logo">
              <span className="logo-icon">🐾</span>
              <span className="logo-text">PetStore</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="navbar-search">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                🔍
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/categories" className="nav-link">Categories</Link>
            <Link to="/about" className="nav-link">About</Link>
            {token && (
              <Link to="/track-orders" className="nav-link">My Orders</Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="nav-link admin-link">Admin</Link>
            )}
          </div>

          {/* User Actions */}
          <div className="navbar-actions">
            <button 
              onClick={handleCartClick} 
              className="cart-button"
              aria-label="Shopping Cart"
            >
              <CartIcon />
            </button>
            
            {!token ? (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            ) : (
              <div className="user-menu">
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-container">
            <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
              Home
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={toggleMobileMenu}>
              About
            </Link>
            {token && (
              <Link to="/track-orders" className="mobile-nav-link" onClick={toggleMobileMenu}>
                My Orders
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="mobile-nav-link admin-link" onClick={toggleMobileMenu}>
                Admin Panel
              </Link>
            )}
            {!token ? (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={toggleMobileMenu}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm" onClick={toggleMobileMenu}>
                  Sign Up
                </Link>
              </div>
            ) : (
              <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="btn btn-outline btn-sm">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Navbar;
