const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('../utils/tokenEncrypt');


const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const resolvers = {
  Query: {
    me: async (_, __, { req }) => req.user || null,
    books: async (_, args) => {
      const { page = 1, limit = 10, genre, author, title } = args;
      const filter = {};
      if (genre) filter.genre = genre;
      if (author) filter.author = new RegExp(author, 'i');
      if (title) filter.title = new RegExp(title, 'i');
      const skip = (page - 1) * limit;
      return Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    },
    availabilityReport: async () => {
      const result = await Book.aggregate([
        { $group: { _id: null, totalBooks: { $sum: "$totalCopies" }, availableBooks: { $sum: "$availableCopies" } } },
        { $project: { _id: 0, totalBooks: 1, availableBooks: 1, borrowedBooks: { $subtract: ["$totalBooks", "$availableBooks"] } } }
      ]);
      return result[0] || { totalBooks: 0, availableBooks: 0, borrowedBooks: 0 };
    },
    mostBorrowedBooks: async () => {
      const pipeline = [
        { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 10 },
        { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "bookDetails" } },
        { $unwind: "$bookDetails" },
        { $replaceRoot: { newRoot: "$bookDetails" } }
      ];
      return Borrow.aggregate(pipeline);
    }
  },
  Mutation: {
    register: async (_, { name, email, password, role }) => {
      const userExists = await User.findOne({ email });
      if (userExists) throw new Error('User exists');
      const user = await User.create({ name, email, password, role: role || 'member' });
      const token = generateToken(user._id);
      user.token = encrypt(token, process.env.TOKEN_ENCRYPTION_KEY);
      return user;
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const match = await user.matchPassword(password);
      if (!match) throw new Error('Invalid credentials');
      const token = generateToken(user._id);
      user.token = encrypt(token, process.env.TOKEN_ENCRYPTION_KEY);
      return user;
    },
    addBook: async (_, args, { req }) => {
      if (!req.user || req.user.role !== 'admin') throw new Error('Not authorized');
      const book = await Book.create({
        ...args,
        totalCopies: args.totalCopies || 1,
        availableCopies: args.totalCopies || 1
      });
      return book;
    },
    borrowBook: async (_, { bookId }, { req }) => {
      if (!req.user || req.user.role !== 'member') throw new Error('Not authorized');
      const book = await Book.findById(bookId);
      if (!book) throw new Error('Book not found');
      if (book.availableCopies <= 0) throw new Error('Not available');
      const b = await Borrow.create({ user: req.user._id, book: book._id });
      book.availableCopies -= 1;
      await book.save();
      return b.populate('book').populate('user');
    },
    returnBook: async (_, { borrowId }, { req }) => {
      if (!req.user || req.user.role !== 'member') throw new Error('Not authorized');
      const borrow = await Borrow.findById(borrowId);
      if (!borrow) throw new Error('Borrow not found');
      if (String(borrow.user) !== String(req.user._id)) throw new Error('Not allowed');
      if (borrow.returnDate) throw new Error('Already returned');
      borrow.returnDate = new Date();
      await borrow.save();
      const book = await Book.findById(borrow.book);
      if (book) { book.availableCopies += 1; await book.save(); }
      return borrow.populate('book').populate('user');
    }
  }
};

module.exports = resolvers;
