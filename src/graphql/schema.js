const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    token: String
  }

  type Book {
    _id: ID!
    title: String!
    author: String!
    isbn: String
    publicationDate: Date
    genre: String
    totalCopies: Int
    availableCopies: Int
  }

  type Borrow {
    _id: ID!
    user: User!
    book: Book!
    borrowDate: Date
    returnDate: Date
  }

  type AvailabilityReport {
    totalBooks: Int
    availableBooks: Int
    borrowedBooks: Int
  }

  type Query {
    me: User
    books(page: Int, limit: Int, genre: String, author: String, title: String): [Book]
    availabilityReport: AvailabilityReport
    mostBorrowedBooks: [Book]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: String): User
    login(email: String!, password: String!): User
    addBook(title: String!, author: String!, isbn: String, publicationDate: Date, genre: String, totalCopies: Int): Book
    borrowBook(bookId: ID!): Borrow
    returnBook(borrowId: ID!): Borrow
  }
`;

module.exports = typeDefs;
