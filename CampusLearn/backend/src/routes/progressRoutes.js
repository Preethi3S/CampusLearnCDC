const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyCourses,
  getCourseProgress,
  completeModule,
  getAllEnrollments
} = require('../controllers/progressController');
const { exportAllEnrollmentsCsv } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Apply protection to all routes
router.use(protect);

// Student-only routes
router.post('/:courseId/enroll', allowRoles('student'), enrollCourse);
router.get('/my-courses', allowRoles('student'), getMyCourses);
router.get('/:courseId', allowRoles('student'), getCourseProgress);
router.post('/:courseId/levels/:levelId/modules/:moduleId/complete', allowRoles('student'), completeModule);

// Admin-only routes
router.get('/admin/enrollments', allowRoles('admin'), getAllEnrollments);
router.get('/admin/enrollments/export', allowRoles('admin'), exportAllEnrollmentsCsv);

module.exports = router;