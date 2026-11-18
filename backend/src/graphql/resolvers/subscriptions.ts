import { withFilter } from 'graphql-subscriptions';
import { pubsub, EVENTS } from '../subscriptions/pubsub';

export interface Context {
  user?: { id: string; email: string; role: string } | null;
}

const requireAuth = (context: Context) => {
  if (!context?.user) throw new Error('Not authenticated');
};

const metricUpdatedIterator = withFilter(
  () => pubsub.asyncIterator([EVENTS.METRIC_UPDATED]),
  (payload, variables) => {
    // Filter by metric type if specified
    if (!variables.type) return true;
    return payload.metricUpdated.type === variables.type.toLowerCase();
  }
);

export const subscriptionResolvers = {
  metricUpdated: {
    subscribe: (parent: any, args: any, context: Context, info: any) => {
      requireAuth(context);
      return metricUpdatedIterator(parent, args, context, info);
    },
  },

  newSale: {
    subscribe: (_: any, __: any, context: Context) => {
      requireAuth(context);
      return pubsub.asyncIterator([EVENTS.NEW_SALE]);
    },
  },
};
