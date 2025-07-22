const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Add Category (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const category = new Category({ name });
    await category.save();

    res.status(201).json({ message: 'Category added successfully', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Categories (Public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Category (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Category (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const catId = req.params.id;
    let objectId = null;
    if (mongoose.Types.ObjectId.isValid(catId)) {
      objectId = new mongoose.Types.ObjectId(catId);
    }

    const orQuery = objectId
      ? [{ category: objectId }, { category: catId }]
      : [{ category: catId }];

    console.log('DeleteMany query:', JSON.stringify({ $or: orQuery }, null, 2));

    const result = await Product.deleteMany({ $or: orQuery });
    console.log('Deleted products count:', result.deletedCount);

    res.status(200).json({
      message: 'Category and related products deleted successfully',
      deletedProducts: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting category/products:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
});

module.exports = router;
