const Quiz = require('../models/Quiz.js');
const Progress = require('../models/Progress.js');
const asyncHandler = require('express-async-handler');

// Get quiz for a module
const getQuiz = asyncHandler(async (req, res) => {
  const { courseId, levelId, moduleId } = req.params;
  const quiz = await Quiz.findOne({ course: courseId, level: levelId, module: moduleId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
});

// Submit quiz
const submitQuiz = asyncHandler(async (req, res) => {
  const { courseId, levelId, moduleId } = req.params;
  const { answers } = req.body;
  const studentId = req.user._id;

  const quiz = await Quiz.findOne({ course: courseId, level: levelId, module: moduleId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  // calculate score
  let correct = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.answer) correct++;
  });
  const score = (correct / quiz.questions.length) * 100;
  const passed = score >= 50; // passing threshold

  // update progress
  const progress = await Progress.findOne({ student: studentId, course: courseId });
  
    // Handle case where progress document might not exist
    if (!progress) return res.status(404).json({ message: 'Progress not found for student and course' });
    
  const levelProgress = progress.levels.find(l => String(l.levelId) === levelId);
    
    // Handle case where level progress might not exist
    if (!levelProgress) return res.status(404).json({ message: 'Level progress not found' });
    
  const moduleProgress = levelProgress.modules.find(m => String(m.moduleId) === moduleId);
    
    // Handle case where module progress might not exist
    if (!moduleProgress) return res.status(404).json({ message: 'Module progress not found' });

  // check last attempt
  const now = new Date();
  if (moduleProgress.lastAttempt && now - moduleProgress.lastAttempt < 24*60*60*1000 && !moduleProgress.passed) {
    return res.status(403).json({ message: 'Retake allowed only after 24 hours' });
  }

  moduleProgress.passed = passed;
  moduleProgress.score = score;
  moduleProgress.lastAttempt = now;
  if (passed) moduleProgress.completed = true; // unlock next module

  await progress.save();
  res.json({ score, passed });
});


// Export functions using CommonJS module.exports
module.exports = {
    getQuiz,
    submitQuiz
};