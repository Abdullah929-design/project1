const express = require('express');
const router = express.Router();
const { getAbout, updateAbout } = require('../controllers/aboutController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/', getAbout);
router.post('/', auth, isAdmin, updateAbout);

module.exports = router; 