# 🏦 Banking System API

A backend banking system built with **Node.js**, **Express.js**, and **MongoDB** that simulates real-world financial transaction workflows. The project focuses on secure authentication, ledger-based accounting, transaction consistency, and idempotent money transfers.

## 🚀 Features

* JWT Authentication & Authorization
* Secure Password Hashing with bcrypt
* Cookie-Based Session Support
* Token Blacklisting with MongoDB TTL Indexes
* Account Management
* Ledger-Based Balance Calculation
* Double-Entry Bookkeeping
* MongoDB Transactions & Sessions
* Idempotent Money Transfers
* System User Role for Internal Operations
* Email Notifications with Nodemailer & Gmail OAuth2

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT (jsonwebtoken)
* bcryptjs
* Nodemailer
* cookie-parser
* dotenv

---

## 🏗️ Architecture

Instead of storing balances directly in the account document, the system uses a **ledger-based accounting model**.

```text
User
  ↓
Account
  ↓
Transaction
  ├── Debit Ledger Entry
  └── Credit Ledger Entry
  ↓
Balance = Credits - Debits
```

This approach provides:

* Full transaction history
* Auditability
* Immutable financial records
* Consistent balance calculation

---

## 🔑 Key Concepts Implemented

### Ledger-Based Accounting

Every transfer creates:

* One debit entry
* One credit entry

Balance is calculated dynamically using MongoDB Aggregation Pipelines.

---

### MongoDB Transactions

Transfers are executed inside MongoDB sessions:

```text
Start Session
    ↓
Create Transaction
    ↓
Create Debit Ledger
    ↓
Create Credit Ledger
    ↓
Commit
```

If any step fails, the transaction is rolled back.

---

### Idempotency Protection

Each transfer requires a unique `idempotencyKey`.

This prevents duplicate transfers caused by:

* Network retries
* Double-clicks
* Duplicate API requests

---

### Token Blacklisting

Logged-out JWTs are stored in a blacklist collection.

A MongoDB TTL index automatically removes expired tokens after 24 hours.

---

## 📁 Project Structure

```text
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── services/
├── db/
└── app.js
```

---

## ⚙️ Setup

### Clone Repository

```bash
git clone https://github.com/your-username/banking-system.git
cd banking-system
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```env
PORT=3000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_refresh_token
```

### Run Development Server

```bash
npm run dev
```

---

## 📡 Main API Routes

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Accounts

```http
POST /api/accounts
GET /api/accounts
GET /api/accounts/balance/:accountId
```

### Transactions

```http
POST /api/transactions
POST /api/transactions/system/initiate
```

---

## 🔒 Security Features

* Passwords hashed using bcrypt
* JWT-based authentication
* Protected routes using middleware
* Token blacklisting after logout
* Immutable ledger entries
* Role-based authorization for system users

---

## 🎯 Learning Outcomes

This project was built to explore backend concepts commonly used in financial systems:

* Authentication & Authorization
* Database Modeling
* MongoDB Aggregation
* ACID Transactions
* Session Management
* Idempotency
* Ledger Systems
* Secure API Design

---

Built as a backend learning project focused on understanding how real-world payment and banking systems maintain consistency, reliability, and security.
