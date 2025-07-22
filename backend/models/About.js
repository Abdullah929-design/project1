const mongoose = require('mongoose');
const aboutSchema = new mongoose.Schema({
  content: { type: String, required: true }
});
module.exports = mongoose.model('About', aboutSchema); 