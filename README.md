# CRM Backend

A production-ready REST API for a full-featured Customer Relationship Management system. Built with Express 5, TypeScript, Prisma ORM, and PostgreSQL — with AI-powered insights via Groq.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript 6 |
| Framework | Express 5 |
| Database | PostgreSQL via Prisma 7 |
| Auth | JWT (access) + HTTPOnly cookie (refresh) |
| Password Hashing | bcrypt |
| Validation | Zod 4 |
| Email | Nodemailer (SMTP) |
| AI | Groq SDK |
| Logging | Pino + pino-http |
| Security | Helmet, CORS, express-rate-limit |
| Compression | compression |
| File Uploads | Multer + Cloudinary |

---

## Project Structure

```
crm-backend/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── src/
│   ├── app.ts                # Express app, middleware, route mounts
│   ├── server.ts             # Entry point — connect DB, start server
│   ├── config/
│   │   ├── cors.ts           # CORS origin validation
│   │   ├── env.ts            # Zod-validated env variables
│   │   └── logger.ts         # Pino logger + HTTP middleware
│   ├── constants/
│   │   ├── APP_CONSTANTS.ts  # Token expiry, pagination, bcrypt rounds
│   │   ├── ERROR_MESSAGES.ts # Shared error strings
│   │   ├── HTTP_STATUS.ts    # HTTP status codes
│   │   └── ROLES.ts          # ADMIN | MEMBER
│   ├── database/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── lib/
│   │   ├── mailer.ts         # Nodemailer SMTP helpers
│   │   ├── groq.ts           # Groq API wrapper
│   │   └── cloudinary.ts     # Image upload helpers
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT verification → req.user
│   │   ├── role.middleware.ts     # requireRole(role) guard
│   │   ├── validate.middleware.ts # Zod schema validation
│   │   ├── rateLimit.middleware.ts
│   │   ├── error.middleware.ts    # Global error handler
│   │   └── notFound.middleware.ts
│   ├── modules/              # One folder per feature
│   │   ├── auth/             # Login, logout, refresh, password reset
│   │   ├── users/            # User CRUD + profile management
│   │   ├── leads/            # Lead pipeline management
│   │   ├── customers/        # Customer management + lead conversion
│   │   ├── analytics/        # Overview stats, trends, team breakdown
│   │   ├── notifications/    # In-app notification feed
│   │   └── ai/               # Groq-powered CRM insights
│   ├── types/
│   │   ├── api.ts            # PaginatedResult, AuthUser
│   │   ├── express.d.ts      # req.user type augmentation
│   │   └── global.d.ts       # ProcessEnv declarations
│   └── utils/
│       ├── ApiError.ts       # Custom HTTP error class
│       ├── ApiResponse.ts    # Standard response wrapper
│       ├── asyncHandler.ts   # Async route error wrapper
│       └── pagination.ts     # Page/limit parsing helpers
```

Each module follows a strict 5-layer pattern:

```
module/
├── *.controller.ts   → HTTP request/response handling
├── *.service.ts      → Business logic
├── *.repository.ts   → Prisma database queries
├── *.routes.ts       → Express route definitions
├── *.validation.ts   → Zod schemas
└── *.types.ts        → TypeScript interfaces & DTOs
```

---

## Database Schema

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │      Lead        │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ assignedToId    │
│ name            │◄──────│ createdById     │
│ email (unique)  │       │ contactName     │
│ passwordHash    │       │ companyName?    │
│ role            │       │ email?          │
│ passwordReset.. │       │ phone?          │
│ createdAt       │       │ source          │
│ updatedAt       │       │ status          │
└─────────────────┘       │ remarks?        │
        │                 │ deletedAt?      │
        │                 └────────┬────────┘
        │                          │ 1:1
        │                 ┌────────▼────────┐
        │                 │    Customer     │
        │                 ├─────────────────┤
        │◄────────────────│ assignedToId    │
        │◄────────────────│ createdById     │
        │                 │ contactName     │
        │                 │ companyName?    │
        │                 │ dealValue?      │
        │                 │ address?        │
        │                 │ status          │
        │                 │ deletedAt?      │
        │                 └─────────────────┘
        │
        │        ┌──────────────────┐
        │        │   Notification   │
        │        ├──────────────────┤
        └────────│ userId           │
                 │ type             │
                 │ title            │
                 │ message          │
                 │ entityType?      │
                 │ entityId?        │
                 │ isRead           │
                 │ readAt?          │
                 └──────────────────┘
```

**Enums**

| Enum | Values |
|---|---|
| `Role` | `ADMIN` `MEMBER` |
| `LeadStatus` | `NEW` `CONTACTED` `QUALIFIED` `PROPOSAL_SENT` `NEGOTIATION` `WON` `LOST` |
| `LeadSource` | `WEBSITE` `FACEBOOK` `GOOGLE_ADS` `REFERRAL` `PHONE_CALL` `WALK_IN` `OTHER` |
| `CustomerStatus` | `ACTIVE` `INACTIVE` `CHURNED` |

---

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- A Groq API key ([console.groq.com](https://console.groq.com))
- An SMTP account (Gmail app password, Resend, Mailgun, etc.)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev

# 5. (Optional) Seed the database
npm run db:seed

# 6. Start development server with hot reload
npm run dev
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Generate Prisma client + compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:seed` | Seed the database with initial data |

---

## Environment Variables

Create a `.env` file at the project root. All variables are validated at startup — the server will exit with a clear error if any required variable is missing.

```env
# ── Server ───────────────────────────────────────────
NODE_ENV=development          # development | production | test
PORT=5000

# ── Database ─────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

# ── JWT ──────────────────────────────────────────────
JWT_SECRET=your-super-secret-access-token-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-here

# ── CORS & Frontend ───────────────────────────────────
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ── SMTP Email ────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=CRM <no-reply@crm.local>

# ── AI ───────────────────────────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# ── Logging ───────────────────────────────────────────
LOG_LEVEL=info                # fatal | error | warn | info | debug | trace
```

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

All protected routes require:
```
Authorization: Bearer <accessToken>
```

---

### Health Check

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Server health + timestamp |

---

### Auth — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | None | Login with email + password |
| `POST` | `/auth/refresh` | Cookie | Rotate access + refresh tokens |
| `POST` | `/auth/logout` | None | Clear refresh token cookie |
| `POST` | `/auth/forgot-password` | None | Send password reset email |
| `POST` | `/auth/reset-password` | None | Reset password with token |
| `GET` | `/auth/me` | JWT | Get current user profile |

> Auth endpoints are rate-limited to **10 requests / 15 min** per IP.

**Login request/response:**
```json
// POST /auth/login
{ "email": "admin@crm.com", "password": "secret" }

// 200 OK
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Admin", "email": "admin@crm.com", "role": "ADMIN" },
    "accessToken": "eyJ..."
  }
}
// + Set-Cookie: refreshToken=...; HttpOnly; SameSite=Lax
```

---

### Users — `/users`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/users` | JWT | ADMIN | Paginated list of all users |
| `POST` | `/users` | JWT | ADMIN | Create a new user |
| `GET` | `/users/lookup` | JWT | Any | Assignable users (for dropdowns) |
| `PATCH` | `/users/profile` | JWT | Any | Update own profile |
| `PATCH` | `/users/profile/password` | JWT | Any | Change own password |
| `GET` | `/users/:id` | JWT | ADMIN | Get user by ID |
| `PATCH` | `/users/:id` | JWT | ADMIN | Update user by ID |
| `DELETE` | `/users/:id` | JWT | ADMIN | Delete user by ID |

---

### Leads — `/leads`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/leads` | JWT | Any | Paginated leads (scoped to user) |
| `POST` | `/leads` | JWT | ADMIN | Create a new lead |
| `GET` | `/leads/:id` | JWT | Any | Get lead details |
| `PATCH` | `/leads/:id` | JWT | Any | Update lead |
| `DELETE` | `/leads/:id` | JWT | ADMIN | Soft-delete lead |

> **Scoping:** ADMIN sees all leads. MEMBER sees only leads assigned to them or created by them.

---

### Customers — `/customers`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/customers` | JWT | Any | Paginated customers (scoped to user) |
| `POST` | `/customers/from-lead/:leadId` | JWT | Any | Convert a WON lead to customer |
| `GET` | `/customers/:id` | JWT | Any | Get customer details |
| `PATCH` | `/customers/:id` | JWT | Any | Update customer |
| `DELETE` | `/customers/:id` | JWT | ADMIN | Soft-delete customer |

---

### Analytics — `/analytics`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/analytics/overview` | JWT | Any | CRM overview stats |

**Overview response includes:**
- `summary` — total leads, won, lost, open, conversion rate
- `byStatus` — lead count per status
- `bySource` — lead count per acquisition source
- `trend` — daily lead creation count for last 30 days
- `byAssignee` — per-salesperson lead count *(ADMIN only)*
- `team` — total users, admins, members *(ADMIN only)*

---

### Notifications — `/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | JWT | Paginated notification feed |
| `GET` | `/notifications/unread-count` | JWT | Count of unread notifications |
| `PATCH` | `/notifications/read-all` | JWT | Mark all as read |
| `PATCH` | `/notifications/:id/read` | JWT | Mark one as read |

---

### AI Insights — `/ai`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/ai/dashboard-insight` | JWT | Any | Natural-language CRM daily summary |
| `GET` | `/ai/sales-performance` | JWT | ADMIN | Per-rep coaching analysis |

**Dashboard insight response:**
```json
{
  "success": true,
  "data": {
    "summary": "You have 142 active leads with a 23.4% conversion rate. Most leads are coming from Google Ads. 3 leads moved to WON this week.",
    "generatedAt": "2026-06-29T10:00:00.000Z"
  }
}
```

---

### Pagination

All list endpoints support:

```
GET /leads?page=1&limit=20
```

Response shape:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
}
```

Default: `page=1`, `limit=20`. Maximum: `limit=100`.

---

### Error Responses

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

| Status | Meaning |
|---|---|
| `400` | Validation error / bad request |
| `401` | Missing or invalid token |
| `403` | Insufficient role |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Authentication Flow

```
Client                          Server
  │                               │
  │── POST /auth/login ──────────►│
  │◄─ { accessToken } + cookie ───│  (access: 15m, refresh: 7d)
  │                               │
  │── GET /api/v1/... ────────────►│  Authorization: Bearer <accessToken>
  │◄─ 200 data ───────────────────│
  │                               │
  │  (access token expires)       │
  │                               │
  │── POST /auth/refresh ─────────►│  (sends refreshToken cookie automatically)
  │◄─ { new accessToken } ────────│  + rotated refreshToken cookie
  │                               │
  │── POST /auth/logout ──────────►│
  │◄─ 200 + cleared cookie ───────│
```

**Password Reset Flow:**
```
POST /auth/forgot-password { email }
  → SHA-256 hashed token stored in DB (TTL: 15 min)
  → Email sent: {FRONTEND_URL}/reset-password?token=<rawToken>

POST /auth/reset-password { token, newPassword }
  → Server hashes token, looks up user, validates expiry
  → Updates passwordHash, clears reset token
```

---

## Role-Based Access Control

| Feature | ADMIN | MEMBER |
|---|---|---|
| Create leads | ✅ | ❌ |
| Delete leads | ✅ | ❌ |
| View all leads | ✅ | Own only |
| Manage users | ✅ | ❌ |
| Change own password | ✅ | ✅ |
| Update own profile | ✅ | ✅ |
| Convert lead to customer | ✅ | ✅ |
| Delete customers | ✅ | ❌ |
| View analytics overview | ✅ (full) | ✅ (scoped) |
| AI dashboard insight | ✅ | ✅ |
| AI sales performance | ✅ | ❌ |

---

## Security

| Feature | Detail |
|---|---|
| Security headers | Helmet (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | 10 req/15m on auth, 300 req/15m on all API routes |
| CORS | Configurable origin allowlist with credentials support |
| Passwords | bcrypt with 10 salt rounds |
| JWT | Short-lived access tokens (15m) + rotating refresh tokens |
| Refresh tokens | HTTPOnly, Secure, SameSite cookie (not accessible via JS) |
| Password reset tokens | SHA-256 hashed in DB, 15-minute TTL |
| Request validation | Zod schema validation on all inputs |
| Soft deletes | Leads and customers use `deletedAt` — data is never hard-deleted |
| Log redaction | Authorization and cookie headers redacted from HTTP logs |
| Response compression | gzip via compression middleware |
