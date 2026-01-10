import { DateTimeResolver } from 'graphql-scalars';
import { queryResolvers } from './queries';
import { mutationResolvers } from './mutations';
import { subscriptionResolvers } from './subscriptions';

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
};
