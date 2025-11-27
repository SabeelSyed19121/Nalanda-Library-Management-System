Project overview

Nalanda is a Library Management System backend built with Node.js, Express and MongoDB. It provides RESTful APIs to manage users, books, borrowing/return flows, fines, and administrative operations. The backend is designed to be consumed by a frontend (web or mobile) and to support authentication and role-based access control.

This README contains a complete analysis of the server-side design, detailed explanations of major modules, and practical instructions to get the project running locally and in production.

Goals & scope

Provide CRUD operations for books, users, and loans.

Support user roles (e.g., student, faculty, librarian, admin) with role-based access control (RBAC).

Secure authentication using JWTs and password hashing.

Track book availability (totalCopies, availableCopies) and maintain loan history.

Implement issue/return workflows, due dates, and fine calculation.

Provide clear error messages and robust validation.

Tech stack

Runtime / framework: Node.js, Express

Database: MongoDB (Mongoose ODM)

Auth: JSON Web Tokens (JWT)

Environment: dotenv for config

Dev tooling: nodemon, eslint, prettier

Testing: Jest / Supertest (recommended)

Optional: Docker for containerization, MongoDB Atlas for managed DB

Architecture & design
Folder structure (recommended)
