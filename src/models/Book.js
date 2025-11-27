const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  author: { type: String, required: true, index: true },
  isbn: { type: String, unique: true, sparse: true },
  publicationDate: { type: Date },
  genre: { type: String, index: true },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
