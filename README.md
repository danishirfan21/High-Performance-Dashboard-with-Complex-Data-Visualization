# High-Performance Analytics Dashboard

A full-stack analytics dashboard with live metric updates over GraphQL subscriptions, server-side aggregation, Redis caching and a virtualized, sortable data table. Built with Next.js 14, Apollo GraphQL, MongoDB and Redis.

> **Note:** Real-time metric values are produced by a built-in simulator (`backend/src/utils/metricSimulator.ts`) for demo purposes. The streaming pipeline (MongoDB → PubSub → WebSocket → UI) is real; the data is generated.

## Features

- **Live metrics** - Revenue, users, conversion and growth cards update over authenticated GraphQL subscriptions (WebSocket), with toast notifications.
- **Charts** - Revenue trend (line), sales by category (pie) and user growth (area), built with Recharts.
- **Virtualized products table** - TanStack Virtual rendering, debounced text search and server-side column sorting (name, category, price, sales, revenue).
- **CSV export** - "Export CSV" button on the products table. A sales export endpoint also exists (`GET /api/export/sales`) but has no UI yet.
- **Redis caching** - Read-through cache (60s TTL) on the revenue, category, user-growth and activity-heatmap aggregations. Invalidated on new sales and registrations. Falls back to MongoDB if Redis is unavailable.
- **Server-side aggregation** - MongoDB aggregation pipelines for all chart data.
- **Auth** - JWT login/registration with bcrypt, `viewer` and `admin` roles. `createSale` is admin-only. Queries, subscriptions and exports require a valid token.
- **Safety limits** - Paginated list queries are capped at 500 rows; product sort fields are whitelisted.
- **Rate limiting** - `login` is limited to 5 attempts per email and 20 per IP per 15 minutes; `register` to 5 per IP per hour. Counters live in Redis (in-memory fallback if Redis is down); a successful login clears the email counter.
- **System theme** - Light/dark follows the OS preference (no manual toggle yet).

### Not implemented yet

Date range picker UI (the dashboard uses a default 30-day range), activity heatmap UI (the GraphQL query exists), sidebar navigation, theme toggle, category filter dropdown, automated tests, code splitting.

## Tech Stack

| Area | Technology |
|------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Recharts, Framer Motion, TanStack Virtual |
| Data fetching | Apollo Client (GraphQL + subscriptions), Axios (REST/CSV) |
| Backend | Node.js, Express, Apollo Server 3, graphql-ws |
| Database / cache | MongoDB 7 (Mongoose), Redis 7 |
| Auth | JWT, bcryptjs |
| DevOps | Docker, Docker Compose |

## Project Structure

```
frontend/                  Next.js app
  app/                     Routes: login, dashboard
  components/              cards, charts, tables, layout, ui
  hooks/                   useRealTimeMetrics, useDebounce, useOptimisticUpdate
  lib/                     apollo-client, axios-client, utils
  store/                   useAuthStore, useDashboardStore (Zustand)
backend/
  src/
    config/                MongoDB and Redis connections
    graphql/               schema, resolvers (queries, mutations, subscriptions), pubsub
    middleware/auth.ts     JWT verification
    models/                User, Metric, Sale, Product
    routes/export.ts       CSV export endpoints
    utils/                 cache.ts (Redis), seed-data.ts, metricSimulator.ts
    server.ts              Express + Apollo + WebSocket server
docker/                    docker-compose.yml, Dockerfiles, .env.example
```

## Quick Start

### Prerequisites

Node.js 20+, and either Docker or local MongoDB and Redis instances.

### Option 1: Docker

```bash
cd docker
cp .env.example .env
# edit docker/.env: set MONGO_PASSWORD and a JWT_SECRET (16+ characters)
docker compose up --build
```

Then seed the database (first run only):

```bash
docker compose exec backend npm run seed
```

### Option 2: Local development

Backend:

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET (16+ characters) and your MongoDB/Redis URLs
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access

- Frontend: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- REST: http://localhost:4000/api (`/health`, `/export/sales`, `/export/products`)

### Demo logins (created by `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Viewer | viewer@example.com | password123 |
| Demo | demo@example.com | password123 |

These are demo credentials for seeded local data only. Never use them in a deployed environment.

## Configuration

| Variable | Where | Notes |
|----------|-------|-------|
| `JWT_SECRET` | backend | **Required**, at least 16 characters. The server refuses to start without it. |
| `MONGODB_URI` | backend | MongoDB connection string |
| `REDIS_URL` | backend | Optional in practice: caching is skipped if Redis is unreachable |
| `FRONTEND_URL` | backend | Allowed CORS origin |
| `MONGO_PASSWORD` | docker/.env | Required by docker-compose |
| `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_API_URL` | frontend | API endpoints |

## Architecture Notes

- **GraphQL vs REST:** GraphQL for queries, mutations and subscriptions; REST only for CSV file downloads.
- **Caching:** `backend/src/utils/cache.ts` wraps aggregation queries. Cache keys truncate dates to the hour so clients sending "now" still hit the cache.
- **Subscriptions:** The PubSub is in-memory, so it works for a single backend instance. Scaling out would need a Redis-backed PubSub, and the metric simulator should then run on one instance only.
- **Auth for subscriptions:** The token is sent in WebSocket `connectionParams` and verified per operation.

## API Overview

```graphql
query { getDashboardMetrics { revenue { value changePercent } users { value changePercent } } }
query { getProducts(filter: { sortBy: "revenue", sortOrder: "desc" }, limit: 100, offset: 0) { id name revenue } }
subscription { metricUpdated { type value changePercent } }
```

REST (Bearer token required for exports):
- `GET /api/export/sales?startDate=X&endDate=Y`
- `GET /api/export/products`
- `GET /api/health`

## Scripts

Backend: `npm run dev`, `npm run build`, `npm start`, `npm run seed`.
Frontend: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

## Known Issues / Roadmap

- Rate limits are keyed on `req.ip`; behind a reverse proxy you must configure Express `trust proxy`, otherwise all users share the proxy's IP.
- GraphQL introspection is enabled in all environments.
- CSV export writes a temp file instead of streaming.
- No automated tests yet (Jest and Playwright are configured but no suites exist).

## License

MIT
