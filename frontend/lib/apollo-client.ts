import { ApolloClient, InMemoryCache, HttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'same-origin',
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Auth link to add token to headers
const authLink = from([
  errorLink,
  httpLink,
]);

// WebSocket link for subscriptions (client-side only)
const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql',
        connectionParams: () => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          return token ? { authorization: `Bearer ${token}` } : {};
        },
        retryAttempts: 5,
        shouldRetry: () => true,
        on: {
          connected: () => console.log('✅ Connected to GraphQL subscriptions'),
          error: (error) => console.error('❌ Subscription error:', error),
        },
      })
    )
  : null;

// Split link: use WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink
    )
  : authLink;

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getProducts: {
            keyArgs: ['filter'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: process.env.NODE_ENV === 'development',
});

// Helper to update authorization header
export const updateAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};
