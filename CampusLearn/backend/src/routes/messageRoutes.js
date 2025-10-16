const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  replyToMessage,
  reactToMessage // This controller name is used for the reaction route
} = require('../controllers/messageController'); 

// Admin can create, edit, delete
router.post('/', protect, createMessage);
router.get('/', protect, getMessages);
router.put('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

// User can reply or react only
router.post('/:id/reply', protect, replyToMessage);

// 🚨 FIX 12: Route name changed from '/react' to '/thumb' 
// to align with frontend naming convention (messageApi.js uses addThumb)
router.post('/:id/thumb', protect, reactToMessage); 

module.exports = router;