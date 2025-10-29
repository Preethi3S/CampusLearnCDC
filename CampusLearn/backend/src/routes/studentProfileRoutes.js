const express = require("express");
const router = express.Router();
const {
  createOrUpdateProfile,
  getStudentProfile,
  updateStudentProfile,
  getStudentProfileById, // ✅ import new controller
} = require("../controllers/studentProfileController");
const { protect, admin } = require("../middleware/authMiddleware");

// For student (self)
router.post("/", protect, createOrUpdateProfile);
router.get("/", protect, getStudentProfile);
router.patch("/", protect, updateStudentProfile);

// For admin (fetch specific student's profile)
router.get("/:id", protect, admin, getStudentProfileById);

module.exports = router;
