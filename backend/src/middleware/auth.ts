import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set (at least 16 characters)');
  }
  return secret;
};

export const verifyToken = (token?: string): JWTPayload | null => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  (req as any).user = user;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden - Admin access required' });
    return;
  }

  next();
};

export const authMiddleware = {
  getJwtSecret,
  verifyToken,
  authenticateJWT,
  requireAdmin,
};
