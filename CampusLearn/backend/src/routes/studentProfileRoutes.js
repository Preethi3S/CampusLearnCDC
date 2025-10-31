const express = require("express");
const router = express.Router();
const {
  createOrUpdateProfile,
  getStudentProfile,
  updateStudentProfile,
  getStudentProfileById, // ✅ import new controller
  updateProfileById,
} = require("../controllers/studentProfileController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

// For student (self)
// Use multer to parse multipart/form-data for profile creation/updating
router.post("/", protect, upload.any(), createOrUpdateProfile);
router.get("/", protect, getStudentProfile);
router.patch("/", protect, upload.any(), updateStudentProfile);

// For admin (fetch specific student's profile)
router.get("/:id", protect, admin, getStudentProfileById);
// Admin can also create/update a profile for any student by id
router.patch("/:id", protect, admin, upload.any(), updateProfileById);

module.exports = router;
