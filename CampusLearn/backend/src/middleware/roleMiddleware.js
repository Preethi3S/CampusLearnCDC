const asyncHandler = require('express-async-handler');

// pass required role(s) e.g. allowRoles('admin') or allowRoles('admin','student')
const allowRoles = (...allowed) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authenticated');
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient permissions');
    }
    next();
  });
};

module.exports = { allowRoles };
