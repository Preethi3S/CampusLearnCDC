const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'user'], // 🚨 FIX 8: Added 'user' role for clarity/completeness
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replies: [
    {
      sender: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User',
          required: true, // 🚨 FIX 9: Replies must have a sender
      },
      content: { 
          type: String, 
          required: true // 🚨 FIX 10: Replies must have content
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  reactions: [
    {
      user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User',
          required: true, // 🚨 FIX 11: Reactions must have a user
      },
      type: { type: String, enum: ['thumbs_up'], default: 'thumbs_up' },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);