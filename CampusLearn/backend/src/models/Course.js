const mongoose = require('mongoose');

// ==========================================================
// 🎯 FIX: ModuleSchema - Use Schema.Types.Mixed for Content
// ==========================================================
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['resource', 'quiz', 'coding'], required: true },
  
  // ❌ REMOVED: resourceUrl, codingLinks (redundant/unused)
  
  // 🌟 CORRECTED FIELD: content must be 'Mixed' 
  // to store a:
  // 1. String (Resource URL) 
  // 2. Object (Coding Prompt/Starter Code)
  // 3. Array (Quiz Questions)
  content: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  
  // Locked state is better managed by the Progress model, but keeping it for now
  locked: { type: Boolean, default: true }, 
  order: { type: Number, default: 0 }
}, { _id: true });

// ==========================================================
// LevelSchema and CourseSchema (Largely Unchanged)
// ==========================================================
const LevelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  modules: { type: [ModuleSchema], default: [] },
  order: { type: Number, default: 0 }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  levels: { type: [LevelSchema], default: [] },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  
  // update updatedAt (pre-save hook is fine)
  updatedAt: { type: Date, default: Date.now }
});

CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);