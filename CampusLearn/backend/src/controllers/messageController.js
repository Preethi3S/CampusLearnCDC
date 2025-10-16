const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// Admin: create message
// controllers/messageController.js
// controllers/messageController.js

const createMessage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can send messages');
  }

  console.log('💬 USER:', req.user);   // <--- ADD THIS
  console.log('💬 BODY:', req.body);   // <--- ADD THIS

  try {
  const message = await Message.create({
    content: req.body.content,
    sender: req.user._id,
    role: req.user.role
  });
  res.status(201).json(message);
} catch (error) {
  console.error('❌ Message save error:', error);
  res.status(400).json({ message: error.message });
}

  
  res.status(201).json(message);
});





// Get all messages (for user or admin)
const getMessages = asyncHandler(async (req, res) => {
    // 🚨 FIX 2: Populate the nested replies.sender and reactions.user
    const messages = await Message.find()
        .populate('sender', 'name role')
        .populate('replies.sender', 'name')
        .populate('reactions.user', 'name'); 
    res.json(messages);
});

// Admin: update message
const updateMessage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can edit messages');
  }
  const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Re-populate the sender and replies/reactions after update
    await updated.populate('sender', 'name role');
    await updated.populate('replies.sender', 'name');
    await updated.populate('reactions.user', 'name');
  res.json(updated);
});

// Admin: delete message
const deleteMessage = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only admin can delete messages');
  }
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted' });
});

// User: reply to message
const replyToMessage = asyncHandler(async (req, res) => {
  const { text } = req.body; // 🚨 FIX 3: Frontend sends 'text' (from Redux slice) not 'reply'
  
  // 🚨 FIX 4: Student cannot reply
  if (req.user.role === 'student') {
    res.status(403);
    throw new Error('Students are not allowed to reply to announcements.');
  }
  
  const message = await Message.findById(req.params.id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  
  // 🚨 FIX 5: Map 'user' to 'sender' and 'text' to 'content' in the subdocument
  message.replies.push({ sender: req.user._id, content: text }); 
  await message.save();
    
  // Return the updated message with all fields populated
    await message.populate('sender', 'name role');
    await message.populate('replies.sender', 'name');
    await message.populate('reactions.user', 'name');

  res.json(message);
});

// User: react (thumbs up)
const reactToMessage = asyncHandler(async (req, res) => {
    // Check if user already reacted (optional, but good practice)
    const userId = req.user._id;

    const message = await Message.findById(req.params.id);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // 🚨 FIX 6: Check if user has already reacted and toggle (if not required, skip this check)
    const existingReactionIndex = message.reactions.findIndex(
        r => r.user.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
        // User reacted, remove it (toggle feature)
        message.reactions.splice(existingReactionIndex, 1);
    } else {
        // User hasn't reacted, add it
        // 🚨 FIX 7: Map 'user' to 'user' in the subdocument (it's correct but confirmed here)
        message.reactions.push({ user: userId, type: 'thumbs_up' });
    }
    
    await message.save();

    // Return the updated message with all fields populated
    await message.populate('sender', 'name role');
    await message.populate('replies.sender', 'name');
    await message.populate('reactions.user', 'name');

  res.json(message);
});

module.exports = {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  replyToMessage,
  reactToMessage
};