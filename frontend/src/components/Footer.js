import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content single-column">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <span className="logo-icon">🐾</span>
              <span className="logo-text">PetStore</span>
            </div>
            <p className="footer-description">
              Your trusted source for premium pet supplies and accessories. We're dedicated to providing the best products for your beloved companions. Whether you have dogs, cats, birds, or small animals, we offer a wide range of quality products to keep your pets healthy, happy, and thriving. Shop with confidence and let us help you care for your furry, feathered, or scaly friends!
            </p>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>493 Talha Block, Bahria Town, Lahore, Pakistan</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>03324838836</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>abdullahsallehaqeel123@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} PetStore. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 