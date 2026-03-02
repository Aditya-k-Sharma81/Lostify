const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinary');

// @route   POST api/discovery/report
// @desc    Submit a discovery report for a lost item
router.post('/report', auth, upload.array('images', 4), discoveryController.submitDiscoveryReport);

router.get('/my-lost-reports', auth, discoveryController.getReportsForMyLostItems);
router.get('/accepted', auth, discoveryController.getAcceptedReports);
router.patch('/status/:id', auth, discoveryController.updateReportStatus);

module.exports = router;
