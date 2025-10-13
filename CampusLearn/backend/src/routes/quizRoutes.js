const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz , updateQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');


const adminAndStaffRoles = ['admin'];

router.put('/:courseId/:levelId/:moduleId', protect, allowRoles(adminAndStaffRoles), updateQuiz);

router.get('/:courseId/:levelId/:moduleId', protect, getQuiz);

router.post('/:courseId/:levelId/:moduleId', protect, submitQuiz);


module.exports = router;