const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { 
  getEnrollmentsByCourse,
  getEnrollmentStats,
  getStudentEnrollments
} = require('../controllers/enrollmentController');

// Protect all routes with authentication
router.use(protect);

// GET /api/enrollments/course/:courseId - Get all enrollments for a specific course
router.get('/course/:courseId', getEnrollmentsByCourse);

// GET /api/enrollments/stats - Get enrollment statistics (counts by course)
router.get('/stats', getEnrollmentStats);

// GET /api/enrollments/student/:studentId - Get all enrollments for a specific student
router.get('/student/:studentId', getStudentEnrollments);

module.exports = router;
