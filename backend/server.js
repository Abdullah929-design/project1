const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aspiring-veterinarians.onrender.com', // backend itself (optional)
    'https://magnificent-rabanadas-087581.netlify.app' // replace with your actual Vercel frontend URL after deployment
  ],
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Protected route example
const authMiddleware = require('./middleware/auth');
app.get('/api/admin', authMiddleware, (req, res) => {
  res.json({ message: 'Welcome to Admin Panel' });
});

const categoryRoutes = require('./routes/category');
app.use('/api/category', categoryRoutes);

const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

const paymentMethodRoutes = require('./routes/paymentMethod');
app.use('/api/payment-methods', paymentMethodRoutes);

const aboutRoutes = require('./routes/about');
app.use('/api/about', aboutRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
