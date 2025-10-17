const StudentProfile = require('../models/StudentProfile');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (file) => {
  if (!file) return null;
  const result = await cloudinary.uploader.upload(file.path, { folder: 'student_profiles' });
  fs.unlinkSync(file.path); // remove temp file
  return result.secure_url;
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const existingProfile = await StudentProfile.findOne({ user: userId });

    const profileData = {
      ...req.body,
      certificates: await uploadFile(req.files?.certificates?.[0]),
      resume: await uploadFile(req.files?.resume?.[0]),
      profilePhoto: await uploadFile(req.files?.profilePhoto?.[0]),
    };

    const profile = existingProfile
      ? await StudentProfile.findOneAndUpdate({ user: userId }, profileData, { new: true })
      : await StudentProfile.create({ user: userId, ...profileData });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
