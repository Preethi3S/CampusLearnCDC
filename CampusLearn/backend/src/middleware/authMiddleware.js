const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }
  try {
    // In dev, log the incoming auth header (partial) to help debug invalid token issues
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.debug('🔐 Incoming Authorization header (truncated):', authHeader ? authHeader.substring(0, 75) : authHeader);
      } catch (e) { /* ignore logging errors */ }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401);
      throw new Error('User not found for provided token');
    }
    
    // Check 1: See the user data being attached
    console.log('👤 Auth Success - User ID:', user._id);
    console.log('👤 Auth Success - User Role:', user.role); 
    
    // Check 2: Ensure ID and role are present before proceeding
    if (!user._id || !user.role) {
      res.status(500);
      throw new Error('User model missing required fields (_id or role). Check database.');
    }

    req.user = user;
    next();
  } catch (err) {
    // Provide more detailed debug info in development to help track down JWT issues
    if (process.env.NODE_ENV !== 'production') {
      console.error('⚠️ JWT verification failed:', { message: err.message, name: err.name });
      // Avoid logging full token for security, but show a short prefix
      try {
        console.debug('🔐 Token prefix:', token ? String(token).slice(0, 20) + '...' : token);
      } catch (e) {}
    }
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});



// Role-based access control middleware
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized - no user information');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Not authorized - requires one of these roles: ${roles.join(', ')}`);
    }
    
    next();
  };
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as admin" });
  }
};

module.exports = {
  protect,
  allowRoles,
  admin
};
