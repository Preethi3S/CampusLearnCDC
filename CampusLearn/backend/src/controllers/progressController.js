const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// Enroll student in a course
const enrollCourse = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const courseId = req.params.courseId;

  // 1. Check if already enrolled
  const exists = await Progress.findOne({ student: studentId, course: courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // -------------------------------------------------------------
  // 🎯 NEW LOGIC: PREREQUISITE COURSE CHECK
  // -------------------------------------------------------------
  if (course.prerequisiteCourse) {
    const prereqId = String(course.prerequisiteCourse);
    
    // Get progress for the prerequisite course
    const prereqProgress = await Progress.findOne({
      student: studentId,
      course: prereqId
    });
    
    if (!prereqProgress) {
      // Fetch title of the prerequisite course for a friendly error message
      const prereqDetails = await Course.findById(prereqId, 'title');
      return res.status(403).json({ 
        message: `Enrollment denied. You must first complete the prerequisite course: "${prereqDetails ? prereqDetails.title : 'Prerequisite Course'}"` 
      });
    }

    // Check if ALL modules across ALL levels of the prerequisite course are completed/passed
    const allModulesCompleted = prereqProgress.levels.every(level => 
      level.modules.every(mod => mod.completed || mod.passed)
    );

    if (!allModulesCompleted) {
      const prereqDetails = await Course.findById(prereqId, 'title');
      return res.status(403).json({ 
        message: `Enrollment denied. You must complete all modules in the prerequisite course: "${prereqDetails ? prereqDetails.title : 'Prerequisite Course'}"` 
      });
    }
  }
  // -------------------------------------------------------------

  // Initialize progress 
  const levels = course.levels.map(level => ({
    levelId: level._id,
    modules: level.modules.map(mod => ({ 
        moduleId: mod._id, 
        completed: false, 
        passed: false, 
        score: 0,      
        lastAttempt: undefined 
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

// Mark module as completed (for non-quiz/non-coding modules)
const completeModule = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { courseId, levelId, moduleId } = req.params;

  // 1. Fetch Course and Progress
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const progress = await Progress.findOne({ student: studentId, course: courseId });
  if (!progress) return res.status(404).json({ message: 'Not enrolled' });

  // 2. Find relevant structures in both documents
  const courseLevel = course.levels.id(levelId);
  if (!courseLevel) return res.status(404).json({ message: 'Level not found in course' });
  
  const levelProgress = progress.levels.find(l => String(l.levelId) === levelId);
  if (!levelProgress) return res.status(404).json({ message: 'Level not found in progress' });

  const moduleIndex = levelProgress.modules.findIndex(m => String(m.moduleId) === moduleId);
  if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found in progress' });

  const courseModuleIndex = courseLevel.modules.findIndex(m => String(m._id) === moduleId);
  if (courseModuleIndex === -1) return res.status(404).json({ message: 'Module not found in course structure' });
  
  // -------------------------------------------------------------
  // 🎯 EXISTING LOGIC: SEQUENTIAL MODULE ACCESS CHECK
  // -------------------------------------------------------------
  if (courseModuleIndex > 0) {
    // Get the details of the preceding module from the course structure
    const prerequisiteModule = courseLevel.modules[courseModuleIndex - 1];
    
    // Get the student's progress for the prerequisite module
    const prerequisiteProgress = levelProgress.modules.find(
      m => String(m.moduleId) === String(prerequisiteModule._id)
    );

    // Check if the prerequisite module is completed OR passed (important for quizzes)
    const isPrereqComplete = prerequisiteProgress && 
      (prerequisiteProgress.completed || prerequisiteProgress.passed);

    if (!isPrereqComplete) {
      return res.status(403).json({ 
        message: `Access denied. Please complete the previous module: "${prerequisiteModule.title}"` 
      });
    }
  }
  
  // If the module is already marked complete, return the progress
  if (levelProgress.modules[moduleIndex].completed) {
    return res.json(progress);
  }

  // --- Existing Completion Logic (Video/Resource validation) ---
  const { playedRanges, duration, playedSeconds } = req.body || {};

  if (Array.isArray(playedRanges) && duration) {
    // Merge ranges and compute covered seconds
    const sorted = playedRanges
      .map(r => ({ start: Number(r.start || r.s || 0), end: Number(r.end || r.e || 0) }))
      .filter(r => r.end > r.start)
      .sort((a, b) => a.start - b.start);

    let merged = [];
    for (const r of sorted) {
      if (!merged.length) merged.push(r);
      else {
        const last = merged[merged.length - 1];
        if (r.start <= last.end + 0.5) { // small gap tolerance
          last.end = Math.max(last.end, r.end);
        } else {
          merged.push(r);
        }
      }
    }

    const covered = merged.reduce((sum, r) => sum + Math.max(0, r.end - r.start), 0);
    const dur = Number(duration) || 0;
    const percent = dur > 0 ? covered / dur : 0;

    const THRESHOLD = 0.9; // require 90% coverage
    if (percent < THRESHOLD) {
      return res.status(400).json({ message: `Watched only ${(percent * 100).toFixed(0)}% (required ${THRESHOLD * 100}%)` });
    }

    // store evidence
    levelProgress.modules[moduleIndex].evidence = { playedRanges: merged, duration: dur, playedSeconds: Number(playedSeconds) || covered };
  }

  // Complete current module
  levelProgress.modules[moduleIndex].completed = true;
  levelProgress.modules[moduleIndex].completedAt = new Date();

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