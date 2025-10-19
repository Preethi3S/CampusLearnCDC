const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const MessagesRoutes = require('./routes/messageRoutes');


const app = express();
app.options('*', cors());

// middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);

// Basic health
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', MessagesRoutes);

// error handler (simple)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ message: err.message || 'Server Error' });
});

module.exports = app;
