const express = require('express');
const router = express.Router();
const lostItemController = require('../controllers/lostItemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinary');

// @route   POST api/lost/report
// @desc    Report a lost item
router.post('/report', auth, upload.array('images', 4), lostItemController.reportLostItem);

// @route   GET api/lost/all
// @desc    Get all lost items
router.get('/all', lostItemController.getLostItems);

router.get('/my-items', auth, lostItemController.getMyLostItems);

module.exports = router;
