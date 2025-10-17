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
  }catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }
});



module.exports = { protect  };
