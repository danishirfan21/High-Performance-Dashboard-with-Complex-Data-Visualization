import { Router } from 'express';
import exportRouter from './export';

const router = Router();

router.use('/export', exportRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
