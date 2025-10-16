const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// GET /api/users - admin only: list users (optionally filter by role)
const listUsers = asyncHandler(async (req, res) => {
  const role = req.query.role; // optional ?role=student
  const filter = {};
  if (role) filter.role = role;
  const users = await User.find(filter).select('name email role createdAt');
  res.json(users);
});

module.exports = { listUsers };
