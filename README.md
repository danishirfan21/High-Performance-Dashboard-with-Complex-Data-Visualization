# High-Performance Analytics Dashboard

> A modern, full-stack analytics dashboard with real-time data visualization, built with the MERN stack, Next.js 14, and GraphQL subscriptions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

## 🎯 Project Overview

This is a portfolio-ready, production-quality analytics dashboard that demonstrates modern web development practices, real-time capabilities, and performance optimization techniques. Built to showcase full-stack development skills for job applications.

### ✨ Key Features

- **Real-time Updates** - GraphQL subscriptions via WebSocket for live metric updates
- **4+ Interactive Charts** - Revenue trends, category sales, user growth, activity heatmap
- **Virtualized Data Table** - Smooth scrolling through 100+ products with filtering and sorting
- **Date Range Filtering** - Flexible date range picker with presets (7d, 30d, 90d)
- **CSV Export** - Download sales and product data via REST API
- **Dark/Light Theme** - Persistent theme toggle with system preference detection
- **Role-Based Access** - Admin and Viewer roles with permission checks
- **Responsive Design** - Mobile-first approach with breakpoints for tablet and desktop
- **Optimistic UI Updates** - Instant feedback with graceful error handling
- **Performance Optimized** - Code splitting, lazy loading, memoization, caching

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.6
- **Styling:** TailwindCSS + shadcn/ui components
- **Data Fetching:** Apollo Client (GraphQL) + Axios (REST)
- **State Management:** Zustand
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Virtualization:** TanStack Virtual
- **Theme:** next-themes

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **GraphQL:** Apollo Server with subscriptions
- **Database:** MongoDB 7.0 with aggregation pipelines
- **Cache:** Redis 7
- **Authentication:** JWT
- **WebSocket:** graphql-ws

### DevOps
- **Containerization:** Docker + Docker Compose
- **Development:** ts-node-dev
- **Testing:** Jest + Playwright
- **Linting:** ESLint + Prettier

## 📁 Project Structure

```
D:\High-Performance Dashboard with Complex Data Visualization/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── login/              # Authentication page
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── charts/             # Chart components (Recharts)
│   │   ├── cards/              # Metric and stat cards
│   │   ├── tables/             # Virtualized product table
│   │   ├── ui/                 # shadcn/ui base components
│   │   └── layout/             # Sidebar, header, theme toggle
│   ├── hooks/
│   │   ├── useRealTimeMetrics.ts    # Subscription hook
│   │   ├── useOptimisticUpdate.ts   # Mutation hook
│   │   └── useDebounce.ts           # Debounce utility
│   ├── lib/
│   │   ├── apollo-client.ts         # Apollo Client setup
│   │   ├── axios-client.ts          # Axios instance
│   │   └── utils.ts                 # Utility functions
│   ├── store/
│   │   ├── useAuthStore.ts          # Authentication state
│   │   └── useDashboardStore.ts     # Dashboard preferences
│   └── types/                       # TypeScript type definitions
│
├── backend/                     # Express application
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts              # User model with bcrypt
│   │   │   ├── Metric.ts            # Metrics (revenue, users, etc.)
│   │   │   ├── Sale.ts              # Sales transactions
│   │   │   └── Product.ts           # Product catalog
│   │   ├── graphql/
│   │   │   ├── schema/typeDefs.ts   # GraphQL schema
│   │   │   ├── resolvers/
│   │   │   │   ├── queries.ts       # Query resolvers
│   │   │   │   ├── mutations.ts     # Mutation resolvers
│   │   │   │   └── subscriptions.ts # Subscription resolvers
│   │   │   └── subscriptions/pubsub.ts
│   │   ├── routes/
│   │   │   ├── export.ts            # CSV export endpoints
│   │   │   └── index.ts             # Route aggregator
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication
│   │   ├── utils/
│   │   │   ├── seed-data.ts         # Database seeding
│   │   │   └── metricSimulator.ts   # Real-time demo
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection
│   │   │   └── redis.ts             # Redis connection
│   │   └── server.ts                # Express + Apollo Server
│   └── tests/                       # Test suites
│
├── docker/
│   ├── docker-compose.yml           # All services orchestration
│   ├── Dockerfile.frontend          # Frontend container
│   └── Dockerfile.backend           # Backend container
│
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "High-Performance Dashboard with Complex Data Visualization"
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start all services with Docker**
   ```bash
   cd docker
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - GraphQL Playground: http://localhost:4000/graphql

### Option 2: Local Development

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB and Redis URLs
   ```

3. **Start MongoDB and Redis** (if not using Docker)
   ```bash
   # MongoDB
   mongod --dbpath /path/to/data

   # Redis
   redis-server
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔐 Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@example.com | password123 |
| **Viewer** | viewer@example.com | password123 |
| **Demo** | demo@example.com | password123 |

## 📊 Features in Detail

### 1. Real-Time Metrics Dashboard

- **4 Key Metrics:** Revenue, Users, Conversion Rate, Growth
- **Live Updates:** GraphQL subscriptions push updates every 7-10 seconds
- **Visual Indicators:** Trend arrows and percentage changes
- **Toast Notifications:** Non-intrusive updates

### 2. Interactive Data Visualizations

- **Revenue Trends (Line Chart):** Daily revenue over selected period
- **Category Sales (Pie Chart):** Sales distribution by category with percentages
- **User Growth (Area Chart):** New vs. total users over time
- **Activity Heatmap:** Sales activity by day of week and hour

### 3. Virtualized Product Table

- **100+ Products:** Smooth scrolling with React Virtual
- **Search:** Debounced search input (300ms delay)
- **Filtering:** By category with dropdown
- **Sorting:** By revenue, sales, rating
- **Columns:** Name, Category, Price, Total Sales, Revenue

### 4. Date Range Filtering

- **Presets:** Last 7 days, 30 days, 90 days
- **Custom Range:** Calendar picker for specific dates
- **Global State:** Zustand persistence across sessions

### 5. CSV Export

- **Sales Export:** Download sales data with date filtering
- **Products Export:** Download complete product catalog
- **Authentication Required:** JWT token verification
- **Format:** Standard CSV with headers

## 🏛️ Architecture Highlights

### GraphQL for Real-time, REST for File Operations

- **GraphQL Queries/Mutations:** Data fetching and updates
- **GraphQL Subscriptions:** Real-time metric pushes
- **REST Endpoints:** CSV file downloads (binary data)

### MongoDB Aggregation Pipelines

Efficient server-side data processing:

```typescript
// Example: Category sales aggregation
await Sale.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$category', value: { $sum: '$amount' } } },
  { $sort: { value: -1 } }
]);
```

### Redis Caching Strategy

- **Dashboard Metrics:** 5-minute TTL
- **Chart Data:** 10-minute TTL
- **Invalidation:** On new sales/mutations

### State Management

- **Zustand:** Global UI state (theme, layout, auth)
- **Apollo Cache:** GraphQL query results
- **React Context:** Theme provider only

### Performance Optimizations

```typescript
// Code Splitting
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Memoization
const chartData = useMemo(() => processData(data), [data]);

// Debouncing
const debouncedSearch = useDebounce(search, 300);
```

## 📈 Performance Metrics

Target metrics for portfolio demonstration:

- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices, SEO)
- **Initial Load:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Frame Rate:** 60fps animations
- **Test Coverage:** 60-70%

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests
npm run e2e
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway / Render)

```bash
cd backend
# Follow platform-specific deployment docs
```

### Database (MongoDB Atlas)

1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Update `MONGODB_URI` in production environment
3. Whitelist deployment server IPs

## 📚 API Documentation

### GraphQL API

**Endpoint:** `http://localhost:4000/graphql`

**Playground:** Available in development mode

**Key Queries:**
```graphql
query GetDashboardMetrics($dateRange: DateRangeInput) {
  getDashboardMetrics(dateRange: $dateRange) {
    revenue { value changePercent }
    users { value changePercent }
  }
}

subscription MetricUpdated {
  metricUpdated {
    type
    value
    changePercent
  }
}
```

### REST API

**Base URL:** `http://localhost:4000/api`

**Endpoints:**
- `GET /api/export/sales?startDate=X&endDate=Y` - Export sales CSV
- `GET /api/export/products` - Export products CSV
- `GET /api/health` - Health check

## 🔧 Development Scripts

### Backend
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production server
npm run seed     # Seed database with sample data
npm test         # Run test suite
```

### Frontend
```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
npm test         # Run Jest tests
npm run e2e      # Run Playwright E2E tests
```

## 🎨 Color Palette

The dashboard uses a professional color scheme with dark mode support:

- **Primary:** Blue (#3B82F6)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Danger:** Red (#EF4444)
- **Dark Background:** #0F172A
- **Light Background:** #FFFFFF

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Please open an issue to discuss changes.

## 📄 License

MIT License - feel free to use this project for learning and portfolio purposes.

## 👨‍💻 Author

Built as a portfolio project to demonstrate:
- Modern full-stack development
- Real-time web applications
- Performance optimization
- Clean code architecture
- DevOps best practices

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful UI components
- **Recharts** - Composable charting library
- **Apollo GraphQL** - Excellent GraphQL client
- **Vercel** - Next.js creators and hosting
- **MongoDB** - Flexible NoSQL database

---

**Portfolio Project** | **January 2026** | **Built with** ❤️ **and ☕**
