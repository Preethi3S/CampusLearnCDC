const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createMessage, getMessages, deleteMessage } = require('../controllers/messageController');

// All logged-in users can view
router.get('/', protect, getMessages);

// Only admin can create
router.post('/', protect, createMessage);

// Only admin can delete
router.delete('/:id', protect, deleteMessage);

module.exports = router;
