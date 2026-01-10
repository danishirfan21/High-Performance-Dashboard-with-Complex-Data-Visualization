import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  # User Types
  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    createdAt: DateTime!
    lastLogin: DateTime
  }

  enum Role {
    ADMIN
    VIEWER
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Metric Types
  type Metric {
    id: ID!
    type: MetricType!
    value: Float!
    previousValue: Float
    change: Float
    changePercent: Float
    timestamp: DateTime!
  }

  enum MetricType {
    REVENUE
    USERS
    CONVERSION
    GROWTH
  }

  # Sale Types
  type Sale {
    id: ID!
    productId: String!
    productName: String!
    category: String!
    amount: Float!
    quantity: Int!
    userId: String!
    status: SaleStatus!
    timestamp: DateTime!
  }

  enum SaleStatus {
    COMPLETED
    PENDING
    REFUNDED
  }

  # Product Types
  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    totalSales: Int!
    revenue: Float!
    rating: Float!
    lastSold: DateTime
  }

  # Dashboard Data Types
  type RevenueDataPoint {
    date: String!
    revenue: Float!
    transactions: Int!
  }

  type CategorySales {
    category: String!
    value: Float!
    count: Int!
    percentage: Float!
  }

  type UserGrowthDataPoint {
    date: String!
    total: Int!
    new: Int!
  }

  type ActivityHeatmapData {
    hour: Int!
    day: String!
    value: Int!
  }

  type DashboardMetrics {
    revenue: Metric!
    users: Metric!
    conversion: Metric!
    growth: Metric!
  }

  # Input Types
  input DateRangeInput {
    startDate: DateTime!
    endDate: DateTime!
  }

  input ProductFilterInput {
    category: String
    minRevenue: Float
    sortBy: String
    sortOrder: String
  }

  # Queries
  type Query {
    # Authentication
    me: User

    # Dashboard metrics
    getDashboardMetrics(dateRange: DateRangeInput): DashboardMetrics!

    # Chart data
    getRevenueData(dateRange: DateRangeInput!): [RevenueDataPoint!]!
    getCategorySales(dateRange: DateRangeInput!): [CategorySales!]!
    getUserGrowth(dateRange: DateRangeInput!): [UserGrowthDataPoint!]!
    getActivityHeatmap(dateRange: DateRangeInput!): [ActivityHeatmapData!]!

    # Products
    getProducts(filter: ProductFilterInput, limit: Int, offset: Int): [Product!]!
    getProductCount(filter: ProductFilterInput): Int!

    # Sales
    getSales(dateRange: DateRangeInput, limit: Int, offset: Int): [Sale!]!
  }

  # Mutations
  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!

    # Admin only - create sale
    createSale(
      productId: String!
      amount: Float!
      quantity: Int!
      userId: String!
    ): Sale!
  }

  # Subscriptions
  type Subscription {
    metricUpdated(type: MetricType): Metric!
    newSale: Sale!
  }
`;
