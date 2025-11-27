const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, publicationDate, genre, totalCopies } = req.body;
  if (!title || !author) {
    res.status(400);
    throw new Error('Title and author required');
  }
  const availableCopies = totalCopies ? parseInt(totalCopies, 10) : 1;
  const book = await Book.create({
    title, author, isbn, publicationDate, genre,
    totalCopies: availableCopies,
    availableCopies: availableCopies
  });
  res.status(201).json(book);
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  const updates = req.body;

  if (updates.totalCopies !== undefined) {
    const delta = updates.totalCopies - book.totalCopies;
    book.availableCopies = Math.max(0, book.availableCopies + delta);
    book.totalCopies = updates.totalCopies;
  }
  Object.assign(book, updates);
  await book.save();
  res.json(book);
});


const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  await book.remove();
  res.json({ message: 'Book removed' });
});

// List books (all users) with pagination and filtering
const listBooks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.genre) filter.genre = req.query.genre;
  if (req.query.author) filter.author = { $regex: req.query.author, $options: 'i' };
  if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };

  const total = await Book.countDocuments(filter);
  const books = await Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

  res.json({
    page, limit, totalPages: Math.ceil(total / limit), total, books
  });
});

// Aggregation: Book availability summary
const availabilityReport = asyncHandler(async (req, res) => {
  const totalBooks = await Book.aggregate([
    { $group: { _id: null, totalBooks: { $sum: "$totalCopies" }, availableBooks: { $sum: "$availableCopies" } } },
    { $project: { _id: 0, totalBooks: 1, availableBooks: 1, borrowedBooks: { $subtract: ["$totalBooks", "$availableBooks"] } } }
  ]);
  res.json(totalBooks[0] || { totalBooks: 0, availableBooks: 0, borrowedBooks: 0 });
});

module.exports = { addBook, updateBook, deleteBook, listBooks, availabilityReport };
