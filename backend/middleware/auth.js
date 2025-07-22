const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  console.log('Auth middleware - Token:', token);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const tokenValue = token.split(' ')[1];
    console.log('Token value:', tokenValue);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    const verified = jwt.verify(tokenValue, process.env.JWT_SECRET);
    console.log('Verified token:', verified);
    console.log('User role from token:', verified.role);
    req.user = verified; // { userId, role }
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    res.status(400).json({ message: 'Invalid Token' });
  }
};
