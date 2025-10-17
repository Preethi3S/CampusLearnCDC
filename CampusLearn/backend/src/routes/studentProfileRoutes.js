const express = require('express');
const router = express.Router();
const { getProfile, createOrUpdateProfile } = require('../controllers/studentProfileController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: '/tmp/' }); // temp storage

router.get('/', protect, getProfile);
router.post('/', protect, upload.fields([
  { name: 'certificates', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
]), createOrUpdateProfile);

module.exports = router;
