const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Product = require('../models/Product');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// POST /api/orders - Create new order (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    console.log('POST /api/orders called');
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      console.log('Invalid content-type:', req.headers['content-type']);
      return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
    }
    const IncomingForm = require('formidable').IncomingForm;
    const form = new IncomingForm({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }
      // Extract string values from arrays (Formidable returns arrays)
      const customerName = Array.isArray(fields.customerName) ? fields.customerName[0] : fields.customerName;
      const contactNumber = Array.isArray(fields.contactNumber) ? fields.contactNumber[0] : fields.contactNumber;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
      const cartItems = Array.isArray(fields.cartItems) ? fields.cartItems[0] : fields.cartItems;
      const amount = Array.isArray(fields.amount) ? fields.amount[0] : fields.amount;
      const paymentMethod = Array.isArray(fields.paymentMethod) ? fields.paymentMethod[0] : fields.paymentMethod;
      const transactionId = Array.isArray(fields.transactionId) ? fields.transactionId[0] : fields.transactionId;
      console.log('Fields:', { customerName, contactNumber, email, address, cartItems, amount, paymentMethod, transactionId });
      console.log('Files:', files);
      // Validate required fields
      if (!customerName || !contactNumber || !email || !address || !cartItems || !amount || !paymentMethod) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'All required fields must be provided' });
      }
      // Parse cartItems if it's a string
      let parsedCartItems;
      try {
        parsedCartItems = typeof cartItems === 'string' ? JSON.parse(cartItems) : cartItems;
      } catch (error) {
        console.log('Error parsing cart items:', error);
        return res.status(400).json({ message: 'Invalid cart items format' });
      }
      // Check stock for all products
      for (const item of parsedCartItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.name}` });
        }
        if (product.quantity < item.qty) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}. Only ${product.quantity} left.` });
        }
      }
      // Decrement stock for all products
      for (const item of parsedCartItems) {
        const prodId = item.productId || item._id;
        await Product.findByIdAndUpdate(prodId, { $inc: { quantity: -item.qty } });
      }
      // Handle payment proof upload
      let paymentProofUrl = null;
      if (files.paymentProof) {
        // Always use the first file if files.paymentProof is an array
        const file = Array.isArray(files.paymentProof) ? files.paymentProof[0] : files.paymentProof;
        const fileBuffer = require('fs').readFileSync(file.filepath);
        paymentProofUrl = await uploadToCloudinary(fileBuffer, file.originalFilename, 'payments');
      }
      // Create order object
      const orderData = {
        user: req.user.userId,
        customerName,
        contactNumber,
        email,
        address,
        cartItems: parsedCartItems,
        amount: parseFloat(amount),
        paymentMethod,
        transactionId: transactionId || null,
        paymentProof: paymentProofUrl
      };
      const order = new Order(orderData);
      await order.save();
      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order._id,
          customerName: order.customerName,
          amount: order.amount,
          status: order.status,
          paymentMethod: order.paymentMethod
        }
      });
    });
  } catch (error) {
    console.error('Outer catch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/orders - Get all orders (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN ORDERS ROUTE HIT (ROOT) ===');
    console.log('Admin user ID:', req.user.userId);
    console.log('Admin role:', req.user.role);
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('cartItems.productId', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/user-orders - Get user's orders (authenticated users)
router.get('/user-orders', auth, async (req, res) => {
  try {
    console.log('=== MY-ORDERS ROUTE HIT ===');
    console.log('Fetching orders for user:', req.user.userId);
    console.log('User role:', req.user.role);
    console.log('Full user object:', req.user);
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    
    // Check if user role is admin
    if (req.user.role === 'admin') {
      console.log('WARNING: User has admin role but accessing my-orders route');
    }
    
    const orders = await Order.find({ user: req.user.userId })
      .populate('cartItems.productId', 'name image')
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);
    console.log('Orders:', orders);

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
});

// GET /api/orders/:id - Get single order (admin only)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    console.log('=== SINGLE ORDER ROUTE HIT ===');
    console.log('Order ID:', req.params.id);
    console.log('User ID:', req.user.userId);
    console.log('User role:', req.user.role);
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('cartItems.productId', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/orders/:id - Delete order (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete payment proof image from Cloudinary if it exists
    if (order.paymentProof) {
      const publicId = order.paymentProof.split('/').pop().split('.')[0];
      await uploadToCloudinary.destroy(publicId, 'payments');
    }

    await order.deleteOne();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 