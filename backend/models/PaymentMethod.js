const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['JazzCash', 'EasyPaisa'],
    required: true
  },
  accountTitle: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
paymentMethodSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema); 