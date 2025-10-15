const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLevel,
  addModule,
  updateModule,
  removeModule
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Public: list or get single (keep these public so the frontend can show available courses to visitors)
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin routes
router.post('/', protect, allowRoles('admin'), createCourse);
router.put('/:id', protect, allowRoles('admin'), updateCourse);
router.delete('/:id', protect, allowRoles('admin'), deleteCourse);

// Levels & Modules (admin)
router.post('/:id/levels', protect, allowRoles('admin'), addLevel);
router.post('/:id/levels/:levelId/modules', protect, allowRoles('admin'), addModule);
router.put('/:id/levels/:levelId/modules/:moduleId', protect, allowRoles('admin'), updateModule);
router.delete('/:id/levels/:levelId/modules/:moduleId', protect, allowRoles('admin'), removeModule);

module.exports = router;
