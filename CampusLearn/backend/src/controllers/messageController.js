const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// --- Create a new message (Admin only) ---
const createMessage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can post announcements');
  }

  const message = await Message.create({
    content: req.body.content,
    sender: req.user._id,
    role: req.user.role,
  });

  res.status(201).json(message);
});

// --- Get all messages ---
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .populate('sender', 'name role');
  res.json(messages);
});

// --- Delete message (Admin only) ---
const deleteMessage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can delete messages');
  }

  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await message.deleteOne();
  res.json({ message: 'Message deleted successfully' });
});

module.exports = {
  createMessage,
  getMessages,
  deleteMessage,
};
