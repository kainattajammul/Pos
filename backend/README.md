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
npx prisma migrate deploy
# Or apply pending migrations in dev:
npx prisma migrate dev
```

**Current schema:** multi-tenant shops, branches, `shop_members`, per-shop `roles`, `permissions`, and role assignments (`shop_member_roles`, `branch_member_roles`). The legacy `users.role_id` / `users.shop_id` columns are removed.

If `migrate` fails (e.g. invalid Supabase password), run `prisma/migrations/20260520140000_shop_multitenant_rbac/migration.sql` in the Supabase SQL Editor, or use `prisma/supabase-full-schema.sql` on a fresh database.

Alternative without migration history (prototyping only):

```bash
npx prisma db push
```

## Run locally

```bash
npm run dev
```

API base: `http://localhost:4000/api/v1`

`GET /api/v1` returns `success: true` with links to main route groups. Use `GET /api/v1/health` for a minimal health check.

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

### Users

| Method | Path        | Auth | Description   |
|--------|-------------|------|---------------|
| POST   | /users      | No   | Create user (links to shop; optional role) |
| GET    | /users      | JWT  | All users     |
| GET    | /users/:id  | JWT  | Single user   |
| PUT    | /users/:id  | No   | Update user (partial; User fields only) |
| DELETE | /users/:id  | No   | Delete user (+ related memberships) |

Also available at `/api/v1/users` (same handlers).

#### Create user

```http
POST http://localhost:4000/api/users
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "12345678",
  "phone": "03001234567",
  "roleId": 1,
  "shopId": 1,
  "status": "ACTIVE"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

Requires an existing `shops` row. If `roleId` is sent, that role must belong to the same `shopId`. Password is bcrypt-hashed; only `passwordHash` is stored.

#### Update user

```http
PUT http://localhost:4000/api/users/1
Content-Type: application/json

{
  "fullName": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123",
  "phone": "03001234567"
}
```

All body fields are optional, but at least one must be sent. Response `200`:

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "fullName": "Updated Name",
    "email": "updated@example.com"
  }
}
```

Returns `404` if the user does not exist, `409` if the email is taken by another user. Password is re-hashed with bcrypt when provided.

#### Delete user

```http
DELETE http://localhost:4000/api/users/1
```

Response `200`:

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

Returns `404` if the user does not exist, `400` for invalid id. Related `shop_members`, `shop_member_roles`, and `branch_member_roles` are removed in a transaction before the user row is deleted (hard delete).

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
