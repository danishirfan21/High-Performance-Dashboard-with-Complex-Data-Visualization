import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Sale from '../../models/Sale';
import Product from '../../models/Product';
import { pubsub, EVENTS } from '../subscriptions/pubsub';
import { getJwtSecret } from '../../middleware/auth';
import { invalidateCache } from '../../utils/cache';
import { enforceRateLimit, resetRateLimit, LIMITS } from '../../utils/rateLimit';

export interface Context {
  user?: { id: string; email: string; role: string };
  ip?: string;
}

export const mutationResolvers = {
  login: async (_: any, { email, password }: { email: string; password: string }, context: Context) => {
    const normalizedEmail = email.toLowerCase();
    const emailKey = `login:email:${normalizedEmail}`;
    await enforceRateLimit(`login:ip:${context.ip ?? 'unknown'}`, LIMITS.loginIp);
    await enforceRateLimit(emailKey, LIMITS.loginEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    await resetRateLimit(emailKey);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      token,
      user,
    };
  },

  register: async (
    _: any,
    { email, password, name }: { email: string; password: string; name: string },
    context: Context
  ) => {
    await enforceRateLimit(`register:ip:${context.ip ?? 'unknown'}`, LIMITS.registerIp);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'viewer', // Default role
    });

    await invalidateCache('usergrowth');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return {
      token,
      user,
    };
  },

  createSale: async (
    _: any,
    { productId, amount, quantity, userId }: { productId: string; amount: number; quantity: number; userId: string },
    context: Context
  ) => {
    if (!context.user) throw new Error('Not authenticated');
    if (context.user.role !== 'admin') throw new Error('Not authorized');

    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be a positive number');
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Quantity must be a positive whole number');

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const sale = await Sale.create({
      productId: product.id,
      productName: product.name,
      category: product.category,
      amount,
      quantity,
      userId,
      status: 'completed',
      timestamp: new Date(),
    });

    // Update product statistics
    product.totalSales += quantity;
    product.revenue += amount;
    product.lastSold = new Date();
    await product.save();

    // Aggregated views are now stale
    await invalidateCache();

    // Publish subscription
    pubsub.publish(EVENTS.NEW_SALE, {
      newSale: sale,
    });

    return sale;
  },
};
