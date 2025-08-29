# Task Manager (MERN) - Server

## Setup
1. Copy `.env.example` to `.env` and adjust values
2. Install dependencies
```bash
cd server
npm install
```
3. Start dev server
```bash
npm run dev
```

## API
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users` (admin)
- `PATCH /users/:id/role` (admin)
- `GET /tasks` (auth)
- `POST /tasks` (auth)
- `GET /tasks/:id` (auth)
- `PATCH /tasks/:id` (auth)
- `DELETE /tasks/:id` (auth)
- `GET /stats/overview` (auth)

## Tests
Run tests:
```bash
npm test
```

##
For making super Admin
use task_manager
db.users.updateOne(
  { email: "admin@gmail.com" },              // find by email
  { $set: { role: "admin" } }                // set role field
)

