const mongoose = require('mongoose');

// =======================
// Module Progress Schema
// =======================
const ModuleProgressSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  passed: { type: Boolean, default: false }, // for quizzes
  score: { type: Number, default: 0 },
  lastAttempt: { type: Date }
}, { _id: false });

// =======================
// Level Progress Schema
// =======================
const LevelProgressSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, required: true },
  modules: { type: [ModuleProgressSchema], default: [] }
}, { _id: false });

// =======================
// Sub-Course Progress Schema
// =======================
const SubCourseProgressSchema = new mongoose.Schema({
  subCourseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  levels: { type: [LevelProgressSchema], default: [] },
  isCompleted: { type: Boolean, default: false }
}, { _id: false });

// =======================
// Main Progress Schema
// =======================
const ProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // Optional: progress of main course levels
  levels: { type: [LevelProgressSchema], default: [] },

  // Progress for sub-courses
  subCourses: { type: [SubCourseProgressSchema], default: [] },

  enrolledAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false } // course completed when all sub-courses done
}, { timestamps: true });

// Ensure a student has only one progress record per course
ProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
