import { withFilter } from 'graphql-subscriptions';
import { pubsub, EVENTS } from '../subscriptions/pubsub';

export const subscriptionResolvers = {
  metricUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENTS.METRIC_UPDATED]),
      (payload, variables) => {
        // Filter by metric type if specified
        if (!variables.type) return true;
        return payload.metricUpdated.type === variables.type.toLowerCase();
      }
    ),
  },

  newSale: {
    subscribe: () => pubsub.asyncIterator([EVENTS.NEW_SALE]),
  },
};
