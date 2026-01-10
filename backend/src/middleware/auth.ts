import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const verifyToken = (token?: string): JWTPayload | null => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  (req as any).user = user;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  next();
};

export const authMiddleware = {
  verifyToken,
  authenticateJWT,
  requireAdmin,
};
