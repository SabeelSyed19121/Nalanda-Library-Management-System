# Nalanda Library Management System — Backend

> **Project:** Nalanda Library Management System (Backend)

## Table of contents

1. Project overview
2. Goals & scope
3. Tech stack
4. Architecture & design
5. Data models
6. API endpoints (detailed)
7. Authentication & authorization
8. Validation & error handling
9. Environment variables
10. Installation & local setup
11. Running (development & production)
12. Testing
13. Deployment suggestions
14. Troubleshooting & common issues
15. Project roadmap & TODOs
16. Contributing & code style
17. License & acknowledgements

---

## Project overview

Nalanda is a Library Management System backend built with Node.js, Express and MongoDB. It provides RESTful APIs to manage users, books, borrowing/return flows, fines, and administrative operations. The backend is designed to be consumed by a frontend (web or mobile) and to support authentication and role-based access control.

---

## Goals & scope

- Provide CRUD operations for books, users, and loans.
- Support user roles with RBAC.
- Secure authentication with JWT.
- Track book availability and maintain loan history.
- Implement issue/return workflows with fines.
- Provide strong validation & error handling.

---

## Tech stack

- Node.js, Express
- MongoDB (Mongoose)
- JWT authentication
- dotenv
- nodemon, ESLint, Prettier
- Jest / Supertest (recommended)

---

## Architecture & design

Recommended folder structure:

```
nalanda-backend/
├─ src/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middlewares/
│  ├─ utils/
│  ├─ config/
│  ├─ services/
│  └─ app.js
├─ tests/
├─ .env.example
├─ package.json
└─ README.md
```

---

## Data models

### User
```js
{
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
}
```

### Book
```js
{
  title: String,
  author: String,
  isbn: String,
  publicationDate: Date,
  genre: String,
  totalCopies: Number,
  availableCopies: Number
}
```

### Loan
```js
{
  book: ObjectId,
  user: ObjectId,
  issueDate: Date,
  dueDate: Date,
  returnDate: Date,
  fine: Number,
  status: String
}
```

---

## API endpoints

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh

### Books
- POST /books
- GET /books
- GET /books/:id
- PUT /books/:id
- DELETE /books/:id

### Loans
- POST /loans/issue
- POST /loans/return
- GET /loans

---

## Authentication & authorization

- Passwords hashed with bcrypt.
- JWT used for secure token-based login.
- RBAC implemented with middleware.

---

## Environment variables

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nalanda
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

---

## Installation & setup

```
npm install
cp .env.example .env
npm run dev
```

---

## Deployment suggestions

- Use MongoDB Atlas
- Add NGINX reverse proxy
- Add monitoring & logs

---

## Troubleshooting

### Invalid key length
Occurs when crypto key length mismatches AES size.

### MongoDB SRV DNS issue
Use non-SRV connection string.

### Race conditions
Use MongoDB transactions or atomic updates.

---

## License
MIT recommended.

