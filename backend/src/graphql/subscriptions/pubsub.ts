import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  METRIC_UPDATED: 'METRIC_UPDATED',
  NEW_SALE: 'NEW_SALE',
};
