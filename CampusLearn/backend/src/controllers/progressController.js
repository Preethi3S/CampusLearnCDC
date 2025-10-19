const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// --- Enroll student in a course ---
const enrollCourse = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courseId = req.params.courseId;

  const exists = await Progress.findOne({ student: studentId, course: courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });

  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  const levels = course.levels.map(level => ({
    levelId: level._id,
    modules: level.modules.map(mod => ({
      moduleId: mod._id,
      completed: false,
      passed: false,
      score: 0,
      lastAttempt: null
    }))
  }));

  const subCourses = course.subCourses.map(sub => ({
    subCourseId: sub._id,
    levels: sub.levels.map(level => ({
      levelId: level._id,
      modules: level.modules.map(mod => ({
        moduleId: mod._id,
        completed: false,
        passed: false,
        score: 0,
        lastAttempt: null
      }))
    })),
    isCompleted: false
  }));

  const progress = await Progress.create({ student: studentId, course: courseId, levels, subCourses });
  res.status(201).json(progress);
});

// --- Complete module in main course ---
const completeModule = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { courseId, levelId, moduleId } = req.params;

  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) throw new Error('Not enrolled');

  const levelProgress = progress.levels.find(l => String(l.levelId) === levelId);
  if (!levelProgress) throw new Error('Level not found');

  const module = levelProgress.modules.find(m => String(m.moduleId) === moduleId);
  if (!module) throw new Error('Module not found');

  module.completed = true;
  module.completedAt = new Date();

  // Mark main course completed if all levels/modules completed
  const allLevelsCompleted = progress.levels.every(l => l.modules.every(m => m.completed));
  progress.isCompleted = allLevelsCompleted && progress.subCourses.every(sc => sc.isCompleted);

  progress.markModified('levels');
  await progress.save();
  res.json(progress);
});

// --- Complete module in sub-course ---
const completeSubCourseModule = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { courseId, subCourseId, levelId, moduleId } = req.params;

  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) throw new Error('Not enrolled');

  const subCourseProgress = progress.subCourses.find(sc => String(sc.subCourseId) === subCourseId);
  if (!subCourseProgress) throw new Error('Sub-course not found');

  const levelProgress = subCourseProgress.levels.find(l => String(l.levelId) === levelId);
  if (!levelProgress) throw new Error('Level not found');

  const module = levelProgress.modules.find(m => String(m.moduleId) === moduleId);
  if (!module) throw new Error('Module not found');

  module.completed = true;
  module.completedAt = new Date();

  // Mark sub-course completed if all levels/modules completed
  subCourseProgress.isCompleted = subCourseProgress.levels.every(l => l.modules.every(m => m.completed));

  // Mark main course completed if all levels and sub-courses completed
  progress.isCompleted = progress.levels.every(l => l.modules.every(m => m.completed)) &&
                         progress.subCourses.every(sc => sc.isCompleted);

  progress.markModified('subCourses');
  await progress.save();
  res.json(progress);
});

// --- Get student's courses ---
const getMyCourses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const progresses = await Progress.find({ student: studentId })
    .populate('course', 'title description levels subCourses');
  res.json(progresses);
});

// --- Get progress for a single course ---
const getCourseProgress = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const progress = await Progress.findOne({ student: studentId, course: req.params.courseId })
    .populate('course', 'title description levels subCourses');
  if (!progress) throw new Error('Not enrolled');
  res.json(progress);
});

module.exports = {
  enrollCourse,
  completeModule,
  completeSubCourseModule,
  getMyCourses,
  getCourseProgress
};
