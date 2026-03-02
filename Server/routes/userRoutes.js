const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinary');

// @route   PUT api/user/update
// @desc    Update user profile
router.put('/update', auth, upload.single('profilePic'), userController.updateProfile);

// @route   GET api/user/profile
// @desc    Get user profile
router.get('/profile', auth, userController.getProfile);

module.exports = router;
