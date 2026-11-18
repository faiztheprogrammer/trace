# Trace

A full-stack project and bug tracking application built with React, Vite, Node.js, Express, and PostgreSQL.

## Tech Stack

- **Frontend:** React, Vite (`frontend/`)
- **Backend:** Node.js, Express (`backend/`)
- **Database:** PostgreSQL (`pg` with parameterized queries)
- **Auth & Security:** Argon2 password hashing, JWT (`Bearer` token), role-based access control (`member` / `admin`)
- **Testing:** Vitest & Supertest (`backend/tests/`)

## Features

- User registration & login (`POST /api/auth/register`, `POST /api/auth/login`)
- Role-based authorization (`member` vs `admin` checked against PostgreSQL)
- Project listing and admin-only project mutations (`/api/projects`)
- Bug CRUD with PostgreSQL persistence, status updates (`Open`, `In Progress`, `Closed`), project assignment, and filtering by `status` and `projectId` (`/api/bugs`)
- Backend health check (`GET /api/health`)

## Local Setup

### 1. Database

Create a PostgreSQL database and apply `backend/database/schema.sql`.

### 2. Backend

Create `backend/.env` with your PostgreSQL and JWT settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

Install dependencies and start the API server (port `3000`):

```bash
cd backend
npm install
npm start
```

### 3. Frontend

Install dependencies and start the Vite dev server (proxies `/api` to `http://localhost:3000`):

```bash
cd frontend
npm install
npm run dev
```

## Running Tests & Checks

Backend integration tests are guarded to run only against `trace_test_db` (`backend/.env.test`):

```bash
cd backend
npx vitest run
```

Frontend lint and production build:

```bash
cd frontend
npm run lint
npm run build
```
