const asyncHandler = require('express-async-handler');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const mongoose = require('mongoose');

const borrowBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  if (!bookId) { res.status(400); throw new Error('bookId required'); }

  const book = await Book.findById(bookId);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  if (book.availableCopies <= 0) { res.status(400); throw new Error('No copies available'); }


  const borrowRecord = await Borrow.create({
    user: req.user._id,
    book: book._id,
    borrowDate: new Date(),
    returnDate: null,
  });

  book.availableCopies -= 1;
  await book.save();

  res.status(201).json(borrowRecord);
});


const returnBook = asyncHandler(async (req, res) => {
  const { borrowId } = req.body;
  if (!borrowId) { res.status(400); throw new Error('borrowId required'); }

  const borrowRecord = await Borrow.findById(borrowId);
  if (!borrowRecord) { res.status(404); throw new Error('Borrow record not found'); }
  if (String(borrowRecord.user) !== String(req.user._id)) {
    res.status(403); throw new Error('Not allowed to return this book');
  }
  if (borrowRecord.returnDate) {
    res.status(400); throw new Error('Book already returned');
  }
  borrowRecord.returnDate = new Date();
  await borrowRecord.save();

  const book = await Book.findById(borrowRecord.book);
  if (book) {
    book.availableCopies += 1;
    await book.save();
  }

  res.json(borrowRecord);
});


const memberHistory = asyncHandler(async (req, res) => {
  const history = await Borrow.find({ user: req.user._id }).populate('book').sort({ borrowDate: -1 });
  res.json(history);
});


const mostBorrowedBooks = asyncHandler(async (req, res) => {
  const pipeline = [
    { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails"
      }
    },
    { $unwind: "$bookDetails" },
    {
      $project: {
        _id: 0,
        bookId: "$bookDetails._id",
        title: "$bookDetails.title",
        author: "$bookDetails.author",
        borrowCount: 1
      }
    }
  ];
  const result = await Borrow.aggregate(pipeline);
  res.json(result);
});


const activeMembers = asyncHandler(async (req, res) => {
  const pipeline = [
    { $group: { _id: "$user", borrowCount: { $sum: 1 } } },
    { $sort: { borrowCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    { $unwind: "$userDetails" },
    { $project: { _id: 0, userId: "$userDetails._id", name: "$userDetails.name", email: "$userDetails.email", borrowCount: 1 } }
  ];
  const result = await Borrow.aggregate(pipeline);
  res.json(result);
});

module.exports = {
  borrowBook,
  returnBook,
  memberHistory,
  mostBorrowedBooks,
  activeMembers,
};
