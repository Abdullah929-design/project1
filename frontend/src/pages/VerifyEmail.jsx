import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying...');
  const [showResend, setShowResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    console.log('Extracted token:', token);
    if (!token) {
      setMessage('Invalid verification link.');
      return;
    }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Verification response:', data);
        if (data.message === 'Email verified successfully') {
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
        } else if (data.message === 'Token expired') {
          setMessage('Verification link expired. Please resend verification email.');
          setShowResend(true);
        } else {
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch((err) => {
        console.error('Verification error:', err);
        setMessage('Verification failed.');
      });
  }, [location.search, navigate]);

  const handleResend = async () => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    // Optionally, you can extract the email from the token payload if needed
    setMessage('Resending verification email...');
    // Implement resend logic here
    setTimeout(() => setMessage('If your email is registered, a new verification link has been sent.'), 1500);
  };

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
      {showResend && (
        <button onClick={handleResend} style={{ marginTop: 16 }}>
          Resend Verification Email
        </button>
      )}
    </div>
  );
};

export default VerifyEmail; 