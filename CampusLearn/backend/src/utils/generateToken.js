const jwt = require('jsonwebtoken');

const generateToken = (userId, role, secret, expiresIn) => {
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};

module.exports = generateToken;
