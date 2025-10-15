const jwt = require('jsonwebtoken');

// generateToken creates a JWT for a user id and role.
// By default it uses process.env.JWT_SECRET and process.env.JWT_EXPIRES_IN
// so callers don't need to pass the secret every time.
const generateToken = (
  userId,
  role,
  secret = process.env.JWT_SECRET,
  expiresIn = process.env.JWT_EXPIRES_IN || '1d'
) => {
  if (!secret) {
    // In case the environment isn't configured, throw a clear error
    // so the app fails fast (server.js already checks for JWT_SECRET at startup).
    throw new Error('JWT secret is not set. Set process.env.JWT_SECRET');
  }
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

module.exports = generateToken;
