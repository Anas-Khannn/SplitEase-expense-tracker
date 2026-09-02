# SplitEase Backend

Backend API for the SplitEase expense tracking application.

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Validation:** Joi
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Environment:** dotenv

## Folder Structure

```text
backend/
├── src/
│   ├── config/          # Environment and database configuration
│   ├── controllers/     # Route handlers
│   ├── database/        # Sequelize models, migrations, seeders
│   │   ├── migrations/
│   │   ├── models/
│   │   └── seeders/
│   ├── middlewares/      # Express middlewares
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── validators/      # Request validation schemas
│   ├── utils/           # Utility functions
│   ├── constants/       # Constants (HTTP statuses, activity types, etc.)
│   ├── errors/          # Custom error classes
│   └── app.js           # Express application setup and entry point
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variable template
├── package.json
└── README.md
```

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Update `.env` with your PostgreSQL credentials and secrets.

## Running the Server

Development (with nodemon):

```bash
npm run dev
```

Production:

```bash
npm start
```

## Health Check

```
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "SplitEase API is running"
}
```

## Database Setup & Seeding

Apply the migrations and seed the development data:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Development Seeded Accounts (LOCAL DEVELOPMENT / TEST ONLY)

The seeders create a few test users for local development. These credentials are
**not** production credentials and must never be used in a real deployment.

| Email             | Name       | Password     |
| ----------------- | ---------- | ------------ |
| `bob@example.com` | Bob Smith  | `Password123!` |
| `alice@example.com` | Alice Johnson | `Password123!` |
| `charlie@example.com` | Charlie Davis | `Password123!` |

All seeded users share the same simple test password (`Password123!`) so they are
easy to use while working locally. The password is stored **only** as a bcrypt
hash (via the project's hashing utility); the raw password is never persisted
and must never be entered anywhere except the login form when testing.

> **Repairing an existing local database.** If your local database was seeded
> before this fix (i.e. the seeded users have a placeholder/invalid password
> hash), simply re-run the seeding once to replace the invalid hashes:
>
> ```bash
> npx sequelize-cli db:seed:all
> ```
>
> The user seeder is idempotent — re-running it updates an existing seeded user's
> password hash in place instead of duplicating it or wiping related data. A
> fresh database is also fully supported by the same command. No destructive
> reset is required in either case.
