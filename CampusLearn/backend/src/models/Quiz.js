const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  questions: [
    {
      question: String,
      options: [String],
      answer: String, // correct answer
    },
  ],
  timeLimit: { type: Number, default: 10 * 60 } // seconds
});

module.exports = mongoose.model('Quiz', quizSchema);
