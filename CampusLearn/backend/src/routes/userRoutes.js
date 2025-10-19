const express = require('express');
const router = express.Router();
const { 
  listUsers, 
  approveUser, 
  rejectUser, 
  deleteUser,
  getStudentEnrollments
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Apply admin protection to all routes
router.use(protect, allowRoles('admin'));

// GET /api/users?role=student&status=pending
router.get('/', listUsers);

// PATCH /api/users/:id/approve
router.patch('/:id/approve', approveUser);

// PATCH /api/users/:id/reject
router.patch('/:id/reject', rejectUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

// GET /api/users/:studentId/enrollments
router.get('/:studentId/enrollments', getStudentEnrollments);

module.exports = router;