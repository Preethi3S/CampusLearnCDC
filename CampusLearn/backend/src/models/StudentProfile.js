const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  department: { type: String },
  address: { type: String, required: true },
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  cgpa: { type: Number, required: true },
  hasArrear: { type: Boolean, default: false },
  arrearsHistory: { type: String, default: '' },
  tenthPercentage: { type: Number, required: true },
  twelfthPercentage: { type: Number, required: true },
  cutoff: { type: Number, required: true },
  certificates: { type: String, required: true },
  resume: { type: String, required: true },
  profilePhoto: { type: String, required: true },
  codingLinks: { type: String, required: true },
  projects: { type: String, default: 'No Projects' },
  achievements: { type: String, default: 'No Achievements' },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
