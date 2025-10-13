const Quiz = require('../models/Quiz.js');
const Progress = require('../models/Progress.js');
const asyncHandler = require('express-async-handler');

const saveQuizForModule = asyncHandler(async (courseId, levelId, moduleId, questions) => {
  const quiz = await Quiz.create({ course: courseId, level: levelId, module: moduleId, questions });
  return quiz;
});

const getQuiz = asyncHandler(async (req, res) => {
  const { courseId, levelId, moduleId } = req.params;
  const quiz = await Quiz.findOne({ course: courseId, level: levelId, module: moduleId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  
  const quizForStudent = { 
    ...quiz.toObject(), 
    questions: quiz.questions.map(q => ({ 
        _id: q._id, 
        text: q.question, 
        options: q.options 
    })) 
};
  res.json(quizForStudent);
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { courseId, levelId, moduleId } = req.params;
  const { answers } = req.body; 
  const studentId = req.user._id;

  const quiz = await Quiz.findOne({ course: courseId, level: levelId, module: moduleId });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  
  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Invalid number of answers submitted.' });
  }

  let correct = 0;
  quiz.questions.forEach((q, idx) => {
    const studentAnswer = String(answers[idx]).trim().toLowerCase();
    const correctAnswer = String(q.answer).trim().toLowerCase();
    if (studentAnswer === correctAnswer) correct++;
  });
  const score = (correct / quiz.questions.length) * 100;
  const passed = score >= 50;

  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) return res.status(404).json({ message: 'Progress not found. Please enroll first.' });

  const levelProgress = progress.levels.find(l => String(l.levelId) === levelId);
  if (!levelProgress) return res.status(404).json({ message: 'Level progress not found' });

  const moduleProgress = levelProgress.modules.find(m => String(m.moduleId) === moduleId);
  if (!moduleProgress) return res.status(404).json({ message: 'Module progress not found' });

  const now = new Date();
  
  if (moduleProgress.lastAttempt) {
    const timeElapsed = now.getTime() - moduleProgress.lastAttempt.getTime();
    if (timeElapsed < 24 * 60 * 60 * 1000 && !moduleProgress.passed) {
      return res.status(403).json({ message: 'Retake allowed only after 24 hours' });
    }
  }

  moduleProgress.passed = passed;
  moduleProgress.score = score;
  moduleProgress.lastAttempt = now;
  
  if (passed) {
    moduleProgress.completed = true; 
    moduleProgress.completedAt = now;
  }

  progress.markModified('levels');

  await progress.save();
  res.json({ score, passed, message: passed ? 'Quiz passed! Module marked complete.' : 'Quiz failed. Try again after 24 hours.' });
});

const updateQuiz = asyncHandler(async (req, res) => {
  const { courseId, levelId, moduleId } = req.params;
  const { questions } = req.body;

  let quiz = await Quiz.findOne({ course: courseId, level: levelId, module: moduleId });
  if (!quiz) {
    quiz = await Quiz.create({ course: courseId, level: levelId, module: moduleId, questions });
  } else {
    quiz.questions = questions;
    await quiz.save();
  }

  res.json(quiz);
});

module.exports = { getQuiz, submitQuiz, saveQuizForModule, updateQuiz };