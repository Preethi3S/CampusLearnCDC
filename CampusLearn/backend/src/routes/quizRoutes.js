const express = require('express');
const { getQuiz, submitQuiz } = require('../controllers/quizController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/:courseId/:levelId/:moduleId', protect, getQuiz);
router.post('/:courseId/:levelId/:moduleId', protect, submitQuiz);

module.exports = router;