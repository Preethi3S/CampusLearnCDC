const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyCourses,
  getCourseProgress,
  completeModule,
  completeSubCourseModule
} = require('../controllers/progressController');

const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Student routes
router.use(protect, allowRoles('student'));

// Enroll in a course
router.post('/:courseId/enroll', enrollCourse);

// Get student's courses and progress
router.get('/my-courses', getMyCourses);
router.get('/:courseId', getCourseProgress);

// Complete module in main course
router.post('/:courseId/levels/:levelId/modules/:moduleId/complete', completeModule);

// Complete module inside a sub-course
router.post('/:courseId/sub-courses/:subCourseId/levels/:levelId/modules/:moduleId/complete', completeSubCourseModule);

module.exports = router;
