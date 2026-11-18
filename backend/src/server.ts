import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { typeDefs } from './graphql/schema/typeDefs';
import { resolvers } from './graphql/resolvers';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { authMiddleware } from './middleware/auth';
import restRoutes from './routes';
import { startMetricSimulator } from './utils/metricSimulator';

// Fail fast if the JWT secret is missing or too short
authMiddleware.getJwtSecret();

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// GraphQL Schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Apollo Server
const apolloServer = new ApolloServer({
  schema,
  context: ({ req }) => {
    // Extract user from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = authMiddleware.verifyToken(token);
    return { user };
  },
  introspection: true,
  cache: 'bounded',
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

// WebSocket Server for Subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: (ctx) => {
      // Extract token from connection params
      const token = (ctx.connectionParams as any)?.authorization?.replace('Bearer ', '');
      const user = authMiddleware.verifyToken(token);
      return { user };
    },
    onConnect: () => {
      console.log('Client connected to GraphQL subscriptions');
    },
    onDisconnect: () => {
      console.log('Client disconnected from GraphQL subscriptions');
    },
  },
  wsServer
);

// REST API Routes
app.use('/api', restRoutes);

// Root health check
app.get('/', (_req, res) => {
  res.json({
    message: 'Analytics Dashboard API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      subscriptions: 'ws://localhost:' + PORT + '/graphql',
      api: '/api',
    },
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Analytics Dashboard Server...');

    // Connect to databases
    await connectDB();
    await connectRedis();

    // Start Apollo Server
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app: app as any, // duplicate @types/express versions make Express/Application mismatch
      path: '/graphql',
      cors: false, // Already handled above
    });

    // Start metric simulator for demo
    if (process.env.NODE_ENV !== 'test') {
      startMetricSimulator();
    }

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('\n✅ Server is running!');
      console.log(`📍 GraphQL API: http://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log(`📍 Subscriptions: ws://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log(`📍 REST API: http://localhost:${PORT}/api`);
      console.log(`📍 Health Check: http://localhost:${PORT}/`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await serverCleanup.dispose();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  await serverCleanup.dispose();
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
