const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// POST /api/payment-methods - Add payment method (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    console.log('POST /api/payment-methods called');
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
      console.log('Fields:', fields);
      console.log('Files:', files);
      // Extract string values from arrays (Formidable returns arrays)
      const method = Array.isArray(fields.method) ? fields.method[0] : fields.method;
      const accountTitle = Array.isArray(fields.accountTitle) ? fields.accountTitle[0] : fields.accountTitle;
      const accountNumber = Array.isArray(fields.accountNumber) ? fields.accountNumber[0] : fields.accountNumber;
      const instructions = Array.isArray(fields.instructions) ? fields.instructions[0] : fields.instructions;
      if (!method || !accountTitle || !accountNumber || !instructions) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'All fields are required' });
      }
      if (!['JazzCash', 'EasyPaisa'].includes(method)) {
        console.log('Invalid method:', method);
        return res.status(400).json({ message: 'Method must be either JazzCash or EasyPaisa' });
      }
      if (!files.qrCode) {
        console.log('No qrCode file uploaded');
        return res.status(400).json({ message: 'QR code image is required' });
      }
      try {
        const existingMethod = await PaymentMethod.findOne({ method });
        if (existingMethod) {
          console.log('Payment method already exists:', method);
          return res.status(400).json({ message: `${method} payment method already exists` });
        }
        // Always use the first file if files.qrCode is an array
        const file = Array.isArray(files.qrCode) ? files.qrCode[0] : files.qrCode;
        const fileBuffer = require('fs').readFileSync(file.filepath);
        console.log('Uploading to Cloudinary...');
        const qrCodeUrl = await uploadToCloudinary(fileBuffer, file.originalFilename, 'payment-methods');
        console.log('Cloudinary upload success:', qrCodeUrl);
        const paymentMethod = new PaymentMethod({
          method,
          accountTitle,
          accountNumber,
          qrCodeUrl,
          instructions
        });
        await paymentMethod.save();
        console.log('Payment method saved to DB');
        res.status(201).json({
          message: 'Payment method added successfully',
          paymentMethod
        });
      } catch (innerError) {
        console.error('Error in payment method creation:', innerError);
        res.status(500).json({ message: 'Server error', error: innerError.message });
      }
    });
  } catch (error) {
    console.error('Outer catch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/payment-methods - Get all payment methods (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json(paymentMethods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment-methods/:method - Get specific payment method (public)
router.get('/:method', async (req, res) => {
  try {
    const { method } = req.params;
    
    if (!['JazzCash', 'EasyPaisa'].includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const paymentMethod = await PaymentMethod.findOne({ method });
    
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    res.json(paymentMethod);
  } catch (error) {
    console.error('Get payment method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/payment-methods/:id - Update payment method (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
    }
    const IncomingForm = require('formidable').IncomingForm;
    const form = new IncomingForm({ multiples: false });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }
      // Extract string values from arrays (Formidable returns arrays)
      const method = Array.isArray(fields.method) ? fields.method[0] : fields.method;
      const accountTitle = Array.isArray(fields.accountTitle) ? fields.accountTitle[0] : fields.accountTitle;
      const accountNumber = Array.isArray(fields.accountNumber) ? fields.accountNumber[0] : fields.accountNumber;
      const instructions = Array.isArray(fields.instructions) ? fields.instructions[0] : fields.instructions;
      const updateData = { method, accountTitle, accountNumber, instructions };
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      if (files.qrCode) {
        // Always use the first file if files.qrCode is an array
        const file = Array.isArray(files.qrCode) ? files.qrCode[0] : files.qrCode;
        const fileBuffer = require('fs').readFileSync(file.filepath);
        updateData.qrCodeUrl = await uploadToCloudinary(fileBuffer, file.originalFilename, 'payment-methods');
      }
      const paymentMethod = await PaymentMethod.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      res.json({
        message: 'Payment method updated successfully',
        paymentMethod
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/payment-methods/:id - Delete payment method (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Delete QR code from Cloudinary
    if (paymentMethod.qrCodeUrl) {
      const cloudinary = require('cloudinary').v2;
      // Extract public_id from the URL
      const urlParts = paymentMethod.qrCodeUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicIdWithExt = fileName.split('.')[0];
      const folder = 'payment-methods';
      const publicId = `${folder}/${publicIdWithExt}`;
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (err) {
        // Log but don't block deletion
        console.error('Cloudinary deletion error:', err.message);
      }
    }

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 