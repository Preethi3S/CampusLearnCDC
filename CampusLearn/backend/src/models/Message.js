const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }, // Reply text is stored here
    createdAt: { type: Date, default: Date.now }
});

const reactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['thumbs_up'], default: 'thumbs_up' }
});

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true }, // Main message text is stored here
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'lecturer'], required: true }, // Sender role
    replies: [replySchema],
    reactions: [reactionSchema],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);