const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Personal Information
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    address: { type: String },
    profilePhoto: { type: String }, // Cloudinary URL

    // Academic Information
    collegeName: { type: String },
    department: { type: String },
    degree: { type: String },
    yearOfStudy: { type: Number },
    cgpa: { type: Number },
    tenthPercentage: { type: Number },
    twelfthPercentage: { type: Number },
    backlogs: { type: Number },

    // Skills and Projects
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],

    // Certifications and Documents
    certificates: [{ type: String }], // URLs
    resume: { type: String }, // URL

    // Placement info
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    achievements: [{ type: String }],
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

module.exports = StudentProfile;
