const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { decrypt } = require('../utils/tokenEncrypt');

const protect = asyncHandler(async (req, res, next) => {
  let tokenEncrypted = null;

 
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    tokenEncrypted = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    tokenEncrypted = req.cookies.token;
  }

  if (!tokenEncrypted) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  try {
    const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY;
    const token = decrypt(tokenEncrypted, encryptionKey);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }
    req.user = user; // attach user
    next();
  } catch (err) {
    console.error('Auth error', err);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient role');
    }
    next();
  };
};

module.exports = { protect, authorize };
