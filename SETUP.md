# Quick Setup Guide

## For Recruiters / Evaluators

This guide will get you up and running in **less than 5 minutes**.

### Step 1: Prerequisites Check

Ensure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ Docker Desktop running (`docker --version`)
- ✅ Git installed (`git --version`)

### Step 2: Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd "High-Performance Dashboard with Complex Data Visualization"

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 3: Start with Docker (Recommended)

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
cd docker
docker-compose up --build
```

**Wait 2-3 minutes for services to start...**

### Step 4: Access the Application

Once you see "✅ Server is running!" in the logs:

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:4000
3. **GraphQL Playground:** http://localhost:4000/graphql

### Step 5: Login

Use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Viewer | viewer@example.com | password123 |

### Step 6: Explore Features

After logging in, you'll see:

1. **Dashboard Metrics** - 4 real-time metrics (refresh automatically every 7-10 seconds)
2. **Revenue Chart** - Line chart with daily revenue
3. **Category Sales** - Pie chart showing distribution
4. **User Growth** - Area chart with growth trends
5. **Activity Heatmap** - Weekly activity patterns
6. **Products Table** - Virtualized table with 60+ products
7. **Theme Toggle** - Switch between dark/light mode
8. **CSV Export** - Download sales/product data

---

## Alternative: Local Development (Without Docker)

If you prefer to run without Docker:

### Backend

```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env to point to your local MongoDB and Redis

# Seed database
npm run seed

# Start server
npm run dev
```

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## Troubleshooting

### Port Already in Use

If you see "Port 3000/4000 is already in use":

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Docker Issues

```bash
# Clean restart
docker-compose down
docker system prune -a
docker-compose up --build
```

### Database Not Seeding

```bash
# Manual seed
cd backend
npm run seed
```

---

## What to Look For

### Technical Highlights

1. **Real-Time Updates:** Watch the metrics update automatically (check the toast notifications)
2. **Performance:** Smooth 60fps animations, instant loading
3. **GraphQL Subscriptions:** Open browser console to see WebSocket connection
4. **Virtualization:** Scroll through the products table - notice no lag
5. **Theme Persistence:** Toggle theme, refresh page - setting is saved
6. **Responsive Design:** Resize browser window - layout adapts
7. **Type Safety:** Check any `.ts`/`.tsx` file - full TypeScript coverage
8. **Code Quality:** Clean, readable, well-organized code

### Architecture Highlights

1. **Monorepo Structure:** Separate frontend/backend with shared types
2. **GraphQL + REST:** Both API patterns demonstrated
3. **Real-Time:** WebSocket subscriptions for live updates
4. **Caching:** Redis caching, Apollo cache, browser cache
5. **State Management:** Zustand, Apollo cache, React Context
6. **Performance:** Code splitting, lazy loading, memoization
7. **Security:** JWT auth, role-based access, input validation
8. **DevOps:** Docker Compose, environment configs, CI-ready

---

## Quick Demo Checklist

- [ ] Login with admin credentials
- [ ] Watch real-time metric updates (wait ~10 seconds)
- [ ] Toggle date range (Last 7/30/90 days)
- [ ] Search products in table
- [ ] Export CSV (click Export button)
- [ ] Toggle dark/light theme
- [ ] Open GraphQL Playground (http://localhost:4000/graphql)
- [ ] Check browser console for WebSocket connection
- [ ] Resize window to test responsive design
- [ ] Logout and try viewer role

---

## Next Steps

- Explore the codebase structure
- Check the main README for detailed documentation
- Run tests: `npm test` (backend), `npm run e2e` (frontend)
- Review the GraphQL schema in `backend/src/graphql/schema/typeDefs.ts`
- Check performance optimizations in components

---

**Estimated Setup Time:** 5 minutes
**Estimated Full Exploration Time:** 20-30 minutes
