import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { subDays, subHours, format } from 'date-fns';
import User from '../models/User';
import Product from '../models/Product';
import Sale from '../models/Sale';
import Metric from '../models/Metric';
import { connectDB, disconnectDB } from '../config/database';

const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports'];
const regions = ['North', 'South', 'East', 'West'];
const channels = ['Online', 'In-Store', 'Mobile'];

const productNames = {
  Electronics: ['Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'USB-C Cable', 'Keyboard', 'Mouse', 'Webcam', 'Microphone', 'Monitor', 'Tablet'],
  Clothing: ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket', 'Dress', 'Sweater', 'Socks', 'Hat', 'Scarf', 'Gloves'],
  Food: ['Coffee Beans', 'Tea Set', 'Chocolate Box', 'Protein Bar', 'Energy Drink', 'Granola', 'Nuts Mix', 'Dried Fruit', 'Cookies', 'Candy'],
  Books: ['Programming Guide', 'Business Book', 'Novel', 'Biography', 'Cookbook', 'Travel Guide', 'Self-Help', 'History', 'Science', 'Art'],
  Home: ['Plant Pot', 'Wall Art', 'Desk Lamp', 'Cushion', 'Rug', 'Vase', 'Candle', 'Picture Frame', 'Mirror', 'Clock'],
  Sports: ['Yoga Mat', 'Water Bottle', 'Resistance Band', 'Jump Rope', 'Dumbbells', 'Running Shoes', 'Gym Bag', 'Towel', 'Protein Shaker', 'Foam Roller'],
};

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Metric.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared\n');

    // 1. Seed Users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: subDays(new Date(), 365),
      },
      {
        email: 'viewer@example.com',
        password: hashedPassword,
        name: 'Viewer User',
        role: 'viewer',
        createdAt: subDays(new Date(), 180),
      },
      {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User',
        role: 'viewer',
        createdAt: subDays(new Date(), 90),
      },
    ]);

    console.log(`✅ Seeded ${users.length} users\n`);

    // 2. Seed Products
    console.log('📦 Seeding products...');
    const products = [];

    for (const category of categories) {
      const names = productNames[category as keyof typeof productNames];
      for (let i = 0; i < names.length; i++) {
        products.push({
          name: `${names[i]} ${category === 'Electronics' ? 'Pro' : category === 'Clothing' ? 'Premium' : ''}`,
          category,
          price: Math.floor(Math.random() * 200) + 20, // $20-$220
          stock: Math.floor(Math.random() * 500) + 50,
          totalSales: 0,
          revenue: 0,
          rating: Math.random() * 1.5 + 3.5, // 3.5-5.0 stars
        });
      }
    }

    const savedProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${savedProducts.length} products\n`);

    // 3. Seed Sales (1000 sales over last 90 days)
    console.log('💰 Seeding sales...');
    const sales = [];
    const now = new Date();

    for (let i = 0; i < 1000; i++) {
      const product = savedProducts[Math.floor(Math.random() * savedProducts.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const daysAgo = Math.floor(Math.random() * 90);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = subHours(subDays(now, daysAgo), hoursAgo);

      // 85% completed, 10% pending, 5% refunded
      const rand = Math.random();
      const status = rand < 0.85 ? 'completed' : rand < 0.95 ? 'pending' : 'refunded';

      sales.push({
        productId: product.id,
        productName: product.name,
        category: product.category,
        amount: product.price * quantity,
        quantity,
        userId: users[Math.floor(Math.random() * users.length)].id,
        status,
        timestamp,
        metadata: {
          region: regions[Math.floor(Math.random() * regions.length)],
          channel: channels[Math.floor(Math.random() * channels.length)],
        },
      });
    }

    await Sale.insertMany(sales);
    console.log(`✅ Seeded ${sales.length} sales\n`);

    // 4. Update product statistics
    console.log('📊 Updating product statistics...');
    for (const product of savedProducts) {
      const productSales = sales.filter(
        (s) => s.productId === product.id && s.status === 'completed'
      );
      const totalSales = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = productSales.reduce((sum, s) => sum + s.amount, 0);
      const lastSold =
        productSales.length > 0
          ? productSales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
          : undefined;

      await Product.findByIdAndUpdate(product.id, {
        totalSales,
        revenue,
        lastSold,
      });
    }

    console.log('✅ Product statistics updated\n');

    // 5. Seed Metrics (daily for last 90 days)
    console.log('📈 Seeding metrics...');
    const metrics = [];

    for (let day = 90; day >= 0; day--) {
      const date = subDays(now, day);
      const daySales = sales.filter(
        (s) =>
          s.timestamp >= subDays(date, 1) &&
          s.timestamp < date &&
          s.status === 'completed'
      );

      const dailyRevenue = daySales.reduce((sum, s) => sum + s.amount, 0);

      // Revenue metric
      const prevRevenue = metrics.find(
        (m) => m.type === 'revenue' && m.timestamp < date
      );
      const revenueValue = dailyRevenue > 0 ? dailyRevenue : Math.random() * 10000 + 5000;
      const revenueChange = prevRevenue
        ? revenueValue - (prevRevenue.value as number)
        : 0;
      const revenueChangePercent = prevRevenue
        ? (revenueChange / (prevRevenue.value as number)) * 100
        : 0;

      metrics.push({
        type: 'revenue',
        value: revenueValue,
        previousValue: prevRevenue?.value,
        change: revenueChange,
        changePercent: revenueChangePercent,
        timestamp: date,
      });

      // Users metric (growing over time)
      const userCount = 1000 + (90 - day) * 3 + Math.floor(Math.random() * 10);
      const prevUsers = metrics.find((m) => m.type === 'users' && m.timestamp < date);
      const userChange = prevUsers ? userCount - (prevUsers.value as number) : 0;
      const userChangePercent = prevUsers
        ? (userChange / (prevUsers.value as number)) * 100
        : 0;

      metrics.push({
        type: 'users',
        value: userCount,
        previousValue: prevUsers?.value,
        change: userChange,
        changePercent: userChangePercent,
        timestamp: date,
      });

      // Conversion rate (2-5%)
      const conversionRate = Math.random() * 3 + 2;
      const prevConversion = metrics.find(
        (m) => m.type === 'conversion' && m.timestamp < date
      );
      const conversionChange = prevConversion
        ? conversionRate - (prevConversion.value as number)
        : 0;
      const conversionChangePercent = prevConversion
        ? (conversionChange / (prevConversion.value as number)) * 100
        : 0;

      metrics.push({
        type: 'conversion',
        value: conversionRate,
        previousValue: prevConversion?.value,
        change: conversionChange,
        changePercent: conversionChangePercent,
        timestamp: date,
      });

      // Growth rate (varying)
      const growthRate = (Math.random() - 0.3) * 20; // -6% to +14%
      const prevGrowth = metrics.find((m) => m.type === 'growth' && m.timestamp < date);
      const growthChange = prevGrowth ? growthRate - (prevGrowth.value as number) : 0;
      const growthChangePercent = prevGrowth
        ? Math.abs(prevGrowth.value as number) > 0.1
          ? (growthChange / (prevGrowth.value as number)) * 100
          : 0
        : 0;

      metrics.push({
        type: 'growth',
        value: growthRate,
        previousValue: prevGrowth?.value,
        change: growthChange,
        changePercent: growthChangePercent,
        timestamp: date,
      });
    }

    await Metric.insertMany(metrics);
    console.log(`✅ Seeded ${metrics.length} metrics\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Products: ${savedProducts.length}`);
    console.log(`   - Sales: ${sales.length}`);
    console.log(`   - Metrics: ${metrics.length}`);
    console.log('═══════════════════════════════════════');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:  admin@example.com / password123');
    console.log('   Viewer: viewer@example.com / password123');
    console.log('   Demo:   demo@example.com / password123');
    console.log('═══════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
