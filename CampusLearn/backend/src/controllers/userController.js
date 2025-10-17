const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// GET /api/users - admin only: list users (with optional filters)
const listUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;
  const filter = {};
  
  if (role) filter.role = role;
  if (status) filter.status = status;
  
  const users = await User.find(filter)
    .select('name username email role status createdAt lastLogin')
    .sort({ createdAt: -1 });
    
  res.json(users);
});

// PATCH /api/users/:id/approve - admin only: approve a user
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.status === 'approved') {
    res.status(400);
    throw new Error('User is already approved');
  }
  
  user.status = 'approved';
  user.updatedAt = Date.now();
  await user.save();
  
  res.json({ 
    message: 'User approved successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    }
  });
});

// PATCH /api/users/:id/reject - admin only: reject a user
const rejectUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason || reason.trim().length < 5) {
    res.status(400);
    throw new Error('Please provide a reason for rejection (min 5 characters)');
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  if (user.status === 'rejected') {
    res.status(400);
    throw new Error('User is already rejected');
  }
  
  user.status = 'rejected';
  user.rejectionReason = reason;
  user.updatedAt = Date.now();
  await user.save();
  
  res.json({ 
    message: 'User rejected successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      status: user.status
    }
  });
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
  approveUser, 
  rejectUser, 
  deleteUser 
};