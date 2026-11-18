import { DateTimeResolver } from 'graphql-scalars';
import { queryResolvers } from './queries';
import { mutationResolvers } from './mutations';
import { subscriptionResolvers } from './subscriptions';

// Queries use .lean(), which returns plain objects with `_id` but no `id` virtual.
const idResolver = { id: (doc: any) => (doc.id ?? doc._id)?.toString() };

export const resolvers = {
  DateTime: DateTimeResolver,

  // Map GraphQL enum names to the lowercase values stored in MongoDB.
  // Without these, serializing user.role / metric.type / sale.status fails.
  Role: { ADMIN: 'admin', VIEWER: 'viewer' },
  MetricType: { REVENUE: 'revenue', USERS: 'users', CONVERSION: 'conversion', GROWTH: 'growth' },
  SaleStatus: { COMPLETED: 'completed', PENDING: 'pending', REFUNDED: 'refunded' },

  User: idResolver,
  Product: idResolver,
  Sale: idResolver,
  Metric: idResolver,

  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
};
