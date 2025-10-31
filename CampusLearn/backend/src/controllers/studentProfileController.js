const StudentProfile = require("../models/StudentProfile");
const cloudinary = require("../utils/cloudinary");

// CREATE or UPDATE (POST)
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Clean up empty fields
    const profileData = {};
    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        profileData[key] = value;
      }
    });

    // Handle file uploads
    if (req.files) {
      if (req.files.certificates) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.certificates[0].path
        );
        profileData.certificates = [uploadRes.secure_url];
      }

      if (req.files.resume) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.resume[0].path
        );
        profileData.resume = uploadRes.secure_url;
      }

      if (req.files.profilePhoto) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.profilePhoto[0].path
        );
        profileData.profilePhoto = uploadRes.secure_url;
      }
    }

    // Create or update (upsert)
    // Normalize some fields: skills as arrays and numeric fields
    if (profileData.technicalSkills && typeof profileData.technicalSkills === 'string') {
      profileData.technicalSkills = profileData.technicalSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (profileData.softSkills && typeof profileData.softSkills === 'string') {
      profileData.softSkills = profileData.softSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    ['yearOfStudy', 'cgpa', 'tenthPercentage', 'twelfthPercentage', 'backlogs'].forEach((key) => {
      if (profileData[key] !== undefined) {
        const num = Number(profileData[key]);
        if (!Number.isNaN(num)) profileData[key] = num;
      }
    });

    const profile = await StudentProfile.findOneAndUpdate(
      { studentId },
      { $set: profileData },
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    console.error("Error saving profile:", err);
    res
      .status(500)
      .json({ message: "Failed to save profile", error: err.message });
  }
};

// GET PROFILE
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user._id; // ✅ Get from logged-in user
    const profile = await StudentProfile.findOne({ studentId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: err.message });
  }
};


// PATCH (explicit update)
exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const profileData = req.body;

    // File uploads
    if (req.files) {
      if (req.files.certificates) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.certificates[0].path
        );
        profileData.certificates = [uploadRes.secure_url];
      }

      if (req.files.resume) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.resume[0].path
        );
        profileData.resume = uploadRes.secure_url;
      }

      if (req.files.profilePhoto) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.profilePhoto[0].path
        );
        profileData.profilePhoto = uploadRes.secure_url;
      }
    }

    if (profileData.technicalSkills && typeof profileData.technicalSkills === 'string') {
      profileData.technicalSkills = profileData.technicalSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (profileData.softSkills && typeof profileData.softSkills === 'string') {
      profileData.softSkills = profileData.softSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    ['yearOfStudy', 'cgpa', 'tenthPercentage', 'twelfthPercentage', 'backlogs'].forEach((key) => {
      if (profileData[key] !== undefined) {
        const num = Number(profileData[key]);
        if (!Number.isNaN(num)) profileData[key] = num;
      }
    });

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { studentId },
      { $set: profileData },
      { new: true }
    );

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error("Error updating profile:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// GET PROFILE BY ID (Admin access)
exports.getStudentProfileById = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ studentId: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Student has not updated their profile yet." });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching profile by ID:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: update or create a profile for a specific student by ID
exports.updateProfileById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const profileData = req.body || {};

    // File uploads
    if (req.files) {
      if (req.files.certificates) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.certificates[0].path
        );
        profileData.certificates = [uploadRes.secure_url];
      }

      if (req.files.resume) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.resume[0].path
        );
        profileData.resume = uploadRes.secure_url;
      }

      if (req.files.profilePhoto) {
        const uploadRes = await cloudinary.uploader.upload(
          req.files.profilePhoto[0].path
        );
        profileData.profilePhoto = uploadRes.secure_url;
      }
    }

    // Normalize fields like in createOrUpdateProfile
    if (profileData.technicalSkills && typeof profileData.technicalSkills === 'string') {
      profileData.technicalSkills = profileData.technicalSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (profileData.softSkills && typeof profileData.softSkills === 'string') {
      profileData.softSkills = profileData.softSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    ['yearOfStudy', 'cgpa', 'tenthPercentage', 'twelfthPercentage', 'backlogs'].forEach((key) => {
      if (profileData[key] !== undefined) {
        const num = Number(profileData[key]);
        if (!Number.isNaN(num)) profileData[key] = num;
      }
    });

    const profile = await StudentProfile.findOneAndUpdate(
      { studentId },
      { $set: profileData },
      { new: true, upsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    console.error('Error updating profile by ID:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

