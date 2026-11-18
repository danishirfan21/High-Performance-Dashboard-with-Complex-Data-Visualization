import { subDays } from 'date-fns';

import Metric from '../../models/Metric';
import Sale from '../../models/Sale';
import Product from '../../models/Product';
import User from '../../models/User';

interface Context {
  user?: { id: string; email: string; role: string };
}

const MAX_PAGE_SIZE = 500;
const DEFAULT_PAGE_SIZE = 100;
const PRODUCT_SORT_FIELDS = ['name', 'category', 'price', 'stock', 'totalSales', 'revenue', 'rating', 'lastSold'];

const clampPagination = (limit?: number | null, offset?: number | null) => ({
  limit: Math.min(Math.max(Math.floor(limit ?? DEFAULT_PAGE_SIZE), 1), MAX_PAGE_SIZE),
  offset: Math.max(Math.floor(offset ?? 0), 0),
});

export const queryResolvers = {
  me: async (_: any, __: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');
    return await User.findById(context.user.id);
  },

  getDashboardMetrics: async (_: any, { dateRange }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const endDate = dateRange?.endDate ? new Date(dateRange.endDate) : new Date();
    const startDate = dateRange?.startDate ? new Date(dateRange.startDate) : subDays(endDate, 30);

    // Fetch latest metrics for each type
    const [revenue, users, conversion, growth] = await Promise.all([
      Metric.findOne({ type: 'revenue', timestamp: { $lte: endDate } })
        .sort({ timestamp: -1 })
        .lean(),
      Metric.findOne({ type: 'users', timestamp: { $lte: endDate } })
        .sort({ timestamp: -1 })
        .lean(),
      Metric.findOne({ type: 'conversion', timestamp: { $lte: endDate } })
        .sort({ timestamp: -1 })
        .lean(),
      Metric.findOne({ type: 'growth', timestamp: { $lte: endDate } })
        .sort({ timestamp: -1 })
        .lean(),
    ]);

    return {
      revenue: revenue || { type: 'revenue', value: 0, timestamp: new Date() },
      users: users || { type: 'users', value: 0, timestamp: new Date() },
      conversion: conversion || { type: 'conversion', value: 0, timestamp: new Date() },
      growth: growth || { type: 'growth', value: 0, timestamp: new Date() },
    };
  },

  getRevenueData: async (_: any, { dateRange }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const sales = await Sale.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(dateRange.startDate),
            $lte: new Date(dateRange.endDate),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          transactions: 1,
          _id: 0,
        },
      },
    ]);

    return sales;
  },

  getCategorySales: async (_: any, { dateRange }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const sales = await Sale.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(dateRange.startDate),
            $lte: new Date(dateRange.endDate),
          },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          value: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Calculate percentages
    const total = sales.reduce((sum, s) => sum + s.value, 0);
    return sales.map(s => ({
      ...s,
      percentage: total > 0 ? (s.value / total) * 100 : 0,
    }));
  },

  getUserGrowth: async (_: any, { dateRange }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const users = await User.aggregate([
      {
        $match: {
          createdAt: {
            $lte: new Date(dateRange.endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          new: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate cumulative totals
    let total = 0;
    return users.map((u: any) => {
      total += u.new;
      return {
        date: u._id,
        new: u.new,
        total: total,
      };
    });
  },

  getActivityHeatmap: async (_: any, { dateRange }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const sales = await Sale.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(dateRange.startDate),
            $lte: new Date(dateRange.endDate),
          },
          status: 'completed',
        },
      },
      {
        $project: {
          hour: { $hour: '$timestamp' },
          day: { $dayOfWeek: '$timestamp' },
        },
      },
      {
        $group: {
          _id: { hour: '$hour', day: '$day' },
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          hour: '$_id.hour',
          day: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.day', 1] }, then: 'Sun' },
                { case: { $eq: ['$_id.day', 2] }, then: 'Mon' },
                { case: { $eq: ['$_id.day', 3] }, then: 'Tue' },
                { case: { $eq: ['$_id.day', 4] }, then: 'Wed' },
                { case: { $eq: ['$_id.day', 5] }, then: 'Thu' },
                { case: { $eq: ['$_id.day', 6] }, then: 'Fri' },
                { case: { $eq: ['$_id.day', 7] }, then: 'Sat' },
              ],
              default: 'Unknown',
            },
          },
          value: 1,
          _id: 0,
        },
      },
    ]);

    return sales;
  },

  getProducts: async (_: any, { filter, limit, offset }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const page = clampPagination(limit, offset);

    const query: any = {};
    if (filter?.category) query.category = filter.category;
    if (filter?.minRevenue) query.revenue = { $gte: filter.minRevenue };

    const sortBy = PRODUCT_SORT_FIELDS.includes(filter?.sortBy) ? filter.sortBy : 'revenue';
    const sortOrder = filter?.sortOrder === 'asc' ? 1 : -1;

    return await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(page.limit)
      .skip(page.offset)
      .lean();
  },

  getProductCount: async (_: any, { filter }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const query: any = {};
    if (filter?.category) query.category = filter.category;
    if (filter?.minRevenue) query.revenue = { $gte: filter.minRevenue };

    return await Product.countDocuments(query);
  },

  getSales: async (_: any, { dateRange, limit, offset }: any, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');

    const page = clampPagination(limit, offset);

    const query: any = {};
    if (dateRange) {
      query.timestamp = {
        $gte: new Date(dateRange.startDate),
        $lte: new Date(dateRange.endDate),
      };
    }

    return await Sale.find(query)
      .sort({ timestamp: -1 })
      .limit(page.limit)
      .skip(page.offset)
      .lean();
  },
};
