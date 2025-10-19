const mongoose = require('mongoose');

// =======================
// Module Schema
// =======================
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['resource', 'quiz', 'coding'], required: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} }, // string, object, or array
  locked: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

// =======================
// Level Schema
// =======================
const LevelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  modules: { type: [ModuleSchema], default: [] },
  order: { type: Number, default: 0 }
}, { _id: true });

// =======================
// Sub-Course Schema
// =======================
const SubCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  levels: { type: [LevelSchema], default: [] },
  order: { type: Number, default: 0 }, // ordering of sub-courses
  isCompleted: { type: Boolean, default: false } // tracked per student
}, { _id: true });

// =======================
// Main Course Schema
// =======================
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Main course levels (optional)
  levels: { type: [LevelSchema], default: [] },

  // Nested sub-courses
  subCourses: { type: [SubCourseSchema], default: [] },

  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update `updatedAt` on every save
CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
