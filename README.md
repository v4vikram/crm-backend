# crm-backend

Express + TypeScript + Prisma API for the CRM.

## Setup

```bash
npm install
cp .env.example .env   # fill in real values
npx prisma generate
npm run dev
```

## Scripts

- `npm run dev` — start with hot reload (tsx watch)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled build

## Structure

- `src/config` — env validation, logger, CORS
- `src/database` — Prisma client + connect/disconnect helpers
- `src/lib` — Redis, BullMQ, Cloudinary, mailer
- `src/middlewares` — auth, role, validation, error, 404
- `src/modules/<name>` — one folder per feature (controller, service, repository, routes, validation, types)
- `src/utils` — ApiError, ApiResponse, asyncHandler, pagination, slugify
- `prisma` — schema, migrations, seed
# crm-backend
