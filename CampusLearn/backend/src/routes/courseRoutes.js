const express = require('express');
const router = express.Router();
const {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    // Main Levels/Modules (Original for legacy)
    addLevel,
    addModule,
    updateModule,
    removeModule,
    // Sub-Courses CRUD
    addSubCourse,
    deleteSubCourse, // New
    addLevelToSubCourse,
    removeLevelFromSubCourse, // New
    addModuleToSubCourseLevel,
    removeModuleFromSubCourseLevel, // New
    // Reordering
    reorderSubCourseLevels, // New
    moveLevel // New
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin routes (Main Course)
router.post('/', protect, allowRoles('admin'), createCourse);
router.put('/:id', protect, allowRoles('admin'), updateCourse);
router.delete('/:id', protect, allowRoles('admin'), deleteCourse);

// -----------------------------------------------------------------
// Legacy Main Levels & Modules routes (Kept for compatibility)
// -----------------------------------------------------------------
router.post('/:id/levels', protect, allowRoles('admin'), addLevel);
router.post('/:id/levels/:levelId/modules', protect, allowRoles('admin'), addModule);
router.put('/:id/levels/:levelId/modules/:moduleId', protect, allowRoles('admin'), updateModule);
router.delete('/:id/levels/:levelId/modules/:moduleId', protect, allowRoles('admin'), removeModule);

// -----------------------------------------------------------------
// Sub-Courses & Nested Levels/Modules CRUD
// -----------------------------------------------------------------

// Sub-Courses
router.post('/:id/sub-courses', protect, allowRoles('admin'), addSubCourse);
router.delete('/:id/sub-courses/:subCourseId', protect, allowRoles('admin'), deleteSubCourse); // FIX for 404

// Levels within Sub-Courses
router.post('/:id/sub-courses/:subCourseId/levels', protect, allowRoles('admin'), addLevelToSubCourse);
router.delete('/:id/sub-courses/:subCourseId/levels/:levelId', protect, allowRoles('admin'), removeLevelFromSubCourse); // New Delete Route

// Modules within Sub-Course Levels
router.post('/:id/sub-courses/:subCourseId/levels/:levelId/modules', protect, allowRoles('admin'), addModuleToSubCourseLevel);
router.delete('/:id/sub-courses/:subCourseId/levels/:levelId/modules/:moduleId', protect, allowRoles('admin'), removeModuleFromSubCourseLevel); // New Delete Route

// -----------------------------------------------------------------
// Drag and Drop (Reordering/Moving)
// -----------------------------------------------------------------

// Reorder Levels within a Sub-Course
router.put('/:id/sub-courses/:subCourseId/levels/reorder', protect, allowRoles('admin'), reorderSubCourseLevels);

// Move Level between Sub-Courses (frontend POST/PUTs to this custom endpoint)
// Note: Frontend will send { sourceSubCourseId, destinationSubCourseId, newIndex } in the body
router.put('/:id/levels/:levelId/move', protect, allowRoles('admin'), moveLevel); 


module.exports = router;