# POS Backend

Node.js + Express + Prisma + PostgreSQL (Supabase) API for user authentication and management. Dashboard endpoints return **mock data only**.

## Tech stack

- Node.js (ES modules)
- Express.js
- Prisma ORM
- PostgreSQL on Supabase
- bcrypt, jsonwebtoken, cors, dotenv, Docker

## Folder structure (MVC)

```
backend/
├── prisma/              # Schema + migrations
├── src/
│   ├── config/          # env + database connection
│   ├── constants/       # roles, HTTP codes
│   ├── controllers/     # request handlers (auth, users, dashboard)
│   ├── data/            # mock dashboard data
│   ├── middleware/      # auth, validation, errors
│   ├── models/          # Prisma queries (User model)
│   ├── routes/          # REST route definitions
│   ├── utils/           # JWT, passwords, API helpers
│   ├── validators/      # express-validator rules
│   ├── app.js           # Express app setup
│   └── server.js        # Starts server + DB
├── Dockerfile
├── docker-compose.yml
└── postman/             # Postman collection
```

## Supabase connection (project: **POS**)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project **POS** → **Connect**.
2. Copy the pooler strings (region: `aws-1-ap-northeast-1`) into `backend/.env`:

```env
DATABASE_URL=postgresql://postgres.alrmshmfmkqetlgypoma:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.alrmshmfmkqetlgypoma:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

The publishable key is for the Supabase JS client only. **Prisma uses `DATABASE_URL` with the database password.**

## Prisma migration commands

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with real DATABASE_URL and DIRECT_URL

npx prisma generate
npx prisma migrate dev --name init_users
# Production deploy:
npx prisma migrate deploy
```

Alternative without migration history (prototyping only):

```bash
npx prisma db push
```

## Run locally

```bash
npm run dev
```

API base: `http://localhost:4000/api/v1`

## Docker (API only)

```bash
docker compose up --build
```

Uses Supabase for PostgreSQL — no local Postgres container. Ensure `.env` has a valid `DATABASE_URL`.

## Users table

| Column         | Type        | Notes                    |
|----------------|-------------|--------------------------|
| id             | SERIAL PK   | Auto increment           |
| full_name      | TEXT        |                          |
| email          | TEXT UNIQUE |                          |
| password_hash  | TEXT        | bcrypt                   |
| phone          | TEXT        | Optional                 |
| role_id        | INT         | 1=ADMIN … 6=ACCOUNTANT   |
| shop_id        | INT         | Optional                 |
| status         | TEXT        | Default `active`         |
| last_login     | TIMESTAMP   | Nullable                 |
| created_at     | TIMESTAMP   | Default now              |

## API endpoints

### Auth (public unless noted)

| Method | Path              | Description        |
|--------|-------------------|--------------------|
| POST   | /auth/register    | Register user      |
| POST   | /auth/login       | Login + JWT        |
| POST   | /auth/refresh     | New access token   |
| POST   | /auth/logout      | Clear refresh cookie |
| GET    | /auth/me          | Current user (JWT) |

### Users (JWT required)

| Method | Path        | Description   |
|--------|-------------|---------------|
| GET    | /users      | All users     |
| GET    | /users/:id  | Single user   |
| PUT    | /users/:id  | Update user   |
| DELETE | /users/:id  | Delete user   |

### Dashboard (JWT required, **mock data only**)

| Method | Path                      |
|--------|---------------------------|
| GET    | /dashboard/summary        |
| GET    | /dashboard/revenue        |
| GET    | /dashboard/monthly-sales  |
| GET    | /dashboard/repair-reports   |
| GET    | /dashboard/recent-activities |

## Postman testing

Import `postman/POS-Backend.postman_collection.json`.

1. **Register** → creates a user.
2. **Login** → saves `accessToken` to collection variable automatically.
3. Call protected routes (Users, Dashboard).

### Example: Register

```http
POST http://localhost:4000/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Jane Cashier",
  "email": "jane@fonedoctors.test",
  "password": "SecurePass123",
  "phone": "+441234567890",
  "roleId": 3,
  "shopId": 1
}
```

### Example: Login

```http
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "email": "jane@fonedoctors.test",
  "password": "SecurePass123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbG...",
    "user": {
      "id": "1",
      "email": "jane@fonedoctors.test",
      "role": "CASHIER",
      "name": "Jane Cashier"
    }
  }
}
```

### Example: Get all users (Bearer token)

```http
GET http://localhost:4000/api/v1/users
Authorization: Bearer {{accessToken}}
```

## Role IDs

| role_id | Role               |
|---------|--------------------|
| 1       | ADMIN              |
| 2       | MANAGER            |
| 3       | CASHIER            |
| 4       | TECHNICIAN         |
| 5       | INVENTORY_MANAGER  |
| 6       | ACCOUNTANT         |
