const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Add Product
router.post('/', auth, async (req, res) => {
  try {
    const { name, quantity, description, image, category , price } = req.body;
    if (!name || !quantity || !description || !image || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const product = new Product({ name, quantity, description, image, category, price });
    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get All Products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Product
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, quantity, description, image, category, price } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, quantity, description, image, category, price },
      { new: true }
    );
    res.json({ message: 'Product updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Product
router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
