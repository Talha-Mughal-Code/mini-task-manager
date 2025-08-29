# Task Manager (MERN) - Fullstack

## Overview
This project is a MERN stack task manager application with a React (Vite) frontend and an Express/MongoDB backend.

---

# Frontend - React + Vite

## Setup
1. Navigate to the frontend directory:
```bash
cd client
```
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm run dev
```

### Notes
- Uses Vite for fast development.
- ESLint is included for linting.
- React Fast Refresh enabled.
- Consider using TypeScript for type safety:
  - Template: [React + TS](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)

---

# Backend - Task Manager (MERN) - Server

## Setup
1. Copy `.env.example` to `.env` and update values.
2. Navigate to the backend directory:
```bash
cd server
```
3. Install dependencies:
```bash
npm install
```
4. Start development server:
```bash
npm run dev
```

## API Endpoints
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Users
- `GET /users` (admin only)
- `PATCH /users/:id/role` (admin only)

### Tasks
- `GET /tasks` (auth required)
- `POST /tasks` (auth required)
- `GET /tasks/:id` (auth required)
- `PATCH /tasks/:id` (auth required)
- `DELETE /tasks/:id` (auth required)

### Stats
- `GET /stats/overview` (auth required)

## Tests
Run tests:
```bash
npm test
```

## Super Admin Setup
To make a user admin:
```bash
use task_manager
db.users.updateOne(
  { email: "admin@gmail.com" },    // find by email
  { $set: { role: "admin" } }      // set role field
)
```

---

# Project Structure
```
/client    -> React + Vite frontend
/server    -> Express + MongoDB backend
```

---

# Contribution
- Clone repo
- Set up `.env` files for server
- Run backend and frontend servers separately
- Submit PRs for contributions

---
