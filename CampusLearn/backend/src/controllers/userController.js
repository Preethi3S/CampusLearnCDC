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

// DELETE /api/users/:id - admin only: delete a user
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Prevent deleting own account
  if (user._id.toString() === req.user.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }
  
  await User.deleteOne({ _id: user._id });
  res.json({ message: 'User removed successfully' });
});

module.exports = { 
  listUsers,
  deleteUser 
};
