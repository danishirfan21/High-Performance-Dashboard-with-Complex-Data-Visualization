import { Router } from 'express';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';
import Sale from '../models/Sale';
import Product from '../models/Product';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

router.get('/sales', authenticateJWT, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query: any = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const sales = await Sale.find(query).lean();

    const csvPath = path.join(tempDir, `sales-${Date.now()}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'productName', title: 'Product' },
        { id: 'category', title: 'Category' },
        { id: 'amount', title: 'Amount' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'status', title: 'Status' },
        { id: 'timestamp', title: 'Date' },
      ],
    });

    await csvWriter.writeRecords(sales);

    res.download(csvPath, 'sales-export.csv', (err) => {
      if (err) console.error(err);
      // Clean up file after download
      fs.unlinkSync(csvPath);
    });
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/products', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ revenue: -1 }).lean();

    const csvPath = path.join(tempDir, `products-${Date.now()}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'name', title: 'Product Name' },
        { id: 'category', title: 'Category' },
        { id: 'price', title: 'Price' },
        { id: 'totalSales', title: 'Total Sales' },
        { id: 'revenue', title: 'Revenue' },
        { id: 'stock', title: 'Stock' },
        { id: 'rating', title: 'Rating' },
      ],
    });

    await csvWriter.writeRecords(products);

    res.download(csvPath, 'products-export.csv', (err) => {
      if (err) console.error(err);
      fs.unlinkSync(csvPath);
    });
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
