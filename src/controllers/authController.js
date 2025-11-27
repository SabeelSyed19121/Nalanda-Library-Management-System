const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { encrypt } = require('../utils/tokenEncrypt');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ name, email, password, role: role || 'member' });
  if (user) {
    const token = generateToken(user._id);
    const encrypted = encrypt(token, process.env.TOKEN_ENCRYPTION_KEY);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: encrypted,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    const encrypted = encrypt(token, process.env.TOKEN_ENCRYPTION_KEY);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: encrypted,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };
