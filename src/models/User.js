// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['admin', 'member'], default: 'member' },
// }, { timestamps: true });


// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });


// userSchema.methods.matchPassword = async function(enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);













// src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// PASSWORD HASHING (NO next(), PROMISE-BASED)
userSchema.pre('save', async function () {
  // If password not modified, do nothing
  if (!this.isModified('password')) return;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
