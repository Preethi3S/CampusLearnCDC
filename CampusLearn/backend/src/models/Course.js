const mongoose = require('mongoose');

// ==========================================================
// ModuleSchema 
// ==========================================================
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['resource', 'quiz', 'coding'], required: true },
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  locked: { type: Boolean, default: true }, 
  order: { type: Number, default: 0 }
}, { _id: true });

// ==========================================================
// LevelSchema 
// ==========================================================
const LevelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  modules: { type: [ModuleSchema], default: [] },
  order: { type: Number, default: 0 }
}, { _id: true });

// ==========================================================
// CourseSchema (Updated for Prerequisite)
// ==========================================================
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  levels: { type: [LevelSchema], default: [] },
  isPublished: { type: Boolean, default: false },
  
  // 🎯 NEW FIELD: Course Prerequisite
  prerequisiteCourse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    default: null // Optional
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);