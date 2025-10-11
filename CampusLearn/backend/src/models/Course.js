const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['resource', 'quiz', 'coding'], required: true },
  resourceUrl: String,       // video / content
  codingLinks: [String],
  // for resource: { videoUrl, text, externalLinks }
  // for quiz: reference to Quiz model (optional for phase2)
  // for coding: external link(s) (leetcode/hackerrank)
  content: {
    videoUrl: { type: String },
    text: { type: String },
    externalLinks: [{ type: String }]
  },
  // whether module locked/unlocked (progress system will update this later)
  locked: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

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
  updatedAt: { type: Date, default: Date.now }
});

// update updatedAt
CourseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
