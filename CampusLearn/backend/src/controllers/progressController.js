const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// Enroll student in a course
const enrollCourse = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courseId = req.params.courseId;

  // check if already enrolled
  const exists = await Progress.findOne({ student: studentId, course: courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // initialize progress
  // 🎯 FIX: Initialize the new quiz-related fields (passed, score, lastAttempt)
  const levels = course.levels.map(level => ({
    levelId: level._id,
    modules: level.modules.map(mod => ({ 
        moduleId: mod._id, 
        completed: false, 
        passed: false, // 👈 New field initialization
        score: 0,      // 👈 New field initialization
        lastAttempt: undefined // 👈 New field initialization
    }))
  }));

  const progress = await Progress.create({ student: studentId, course: courseId, levels });
  res.status(201).json(progress);
});

// Get all enrolled courses for student
const getMyCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const progresses = await Progress.find({ student: studentId })
    .populate('course', 'title description levels');
  res.json(progresses);
});

// Get single course progress
const getCourseProgress = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courseId = req.params.courseId;
  const progress = await Progress.findOne({ student: studentId, course: courseId })
    .populate('course', 'title description levels');
  if (!progress) return res.status(404).json({ message: 'Not enrolled' });
  res.json(progress);
});

// progressController.js

// Mark module as completed (for non-quiz/non-coding modules)
const completeModule = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { courseId, levelId, moduleId } = req.params;

  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) return res.status(404).json({ message: 'Not enrolled' });

  const levelProgress = progress.levels.find(l => String(l.levelId) === levelId);
  if (!levelProgress) return res.status(404).json({ message: 'Level not found' });

  const moduleIndex = levelProgress.modules.findIndex(m => String(m.moduleId) === moduleId);
  if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

  // The check for prerequisite completion is commented out, so execution proceeds here.

  // Complete current module
  levelProgress.modules[moduleIndex].completed = true;
  levelProgress.modules[moduleIndex].completedAt = new Date();
  
  // 💡 CRITICAL FIX: Tell Mongoose that the nested 'levels' array has been modified.
  // This is required when modifying subdocuments retrieved via .find() or .findIndex().
  progress.markModified('levels'); 

  await progress.save();
  res.json(progress);
});

module.exports = {
  enrollCourse,
  getMyCourses,
  getCourseProgress,
  completeModule
};