const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyCourses,
  getCourseProgress,
  completeModule
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Student routes
router.use(protect, allowRoles('student'));

router.post('/:courseId/enroll', enrollCourse);
router.get('/my-courses', getMyCourses);
router.get('/:courseId', getCourseProgress);
router.post('/:courseId/levels/:levelId/modules/:moduleId/complete', completeModule);

module.exports = router;