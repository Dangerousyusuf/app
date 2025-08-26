import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    user_id?: number;
    userId?: number;
    iat?: number;
    exp?: number;
  };
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token gereklidir',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET not found',
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as jwt.JwtPayload & {
      user_id?: number;
      userId?: number;
      id?: number;
      email?: string;
    };

    req.user = {
      id: decoded.user_id || decoded.userId || decoded.id || 0,
      email: decoded.email || '',
      user_id: decoded.user_id,
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Geçersiz token',
      });
      return;
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Token doğrulama hatası',
    });
  }
};

export default authMiddleware;
export { AuthenticatedRequest };