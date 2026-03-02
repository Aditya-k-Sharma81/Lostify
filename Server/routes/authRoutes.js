const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/cloudinary');

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', authController.signup);


// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

module.exports = router;
