const mongoose = require('mongoose');

const ModuleProgressSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  
  // 🎯 FIXES ADDED FOR QUIZ/PROGRESS TRACKING:
  passed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  lastAttempt: { type: Date }
  // ----------------------------------------------
}, { _id: false });

const LevelProgressSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, required: true },
  modules: { type: [ModuleProgressSchema], default: [] }
}, { _id: false });

const ProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  levels: { type: [LevelProgressSchema], default: [] },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

ProgressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);