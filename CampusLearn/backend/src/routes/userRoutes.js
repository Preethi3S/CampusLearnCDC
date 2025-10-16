const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Admin-only: list users, optional ?role=student
router.get('/', protect, allowRoles('admin'), listUsers);

module.exports = router;
