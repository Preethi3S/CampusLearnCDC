const express = require('express');
const router = express.Router();
const { listUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { deleteUser } = require('../controllers/userController');
// ... existing code ...
// Admin-only: list users, optional ?role=student
router.get('/', protect, allowRoles('admin'), listUsers);
router.delete('/:id', protect, allowRoles('admin'), deleteUser);
module.exports = router;
