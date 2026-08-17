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
│   ├── app.js           # Express application setup
│   └── server.js        # Server entry point
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
