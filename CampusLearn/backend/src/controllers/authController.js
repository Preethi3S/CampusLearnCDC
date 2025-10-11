const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }
  const user = await User.create({ name, email, password, role });
  if (!user) {
    res.status(500);
    throw new Error('Failed to create user');
  }
  const token = generateToken(user._id, user.role, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  const token = generateToken(user._id, user.role, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  });
});

const getMe = asyncHandler(async (req, res) => {
  // req.user is added by protect middleware
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };
