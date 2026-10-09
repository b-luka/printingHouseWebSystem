import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userData?: {
        userId: string;
        userType: string;
    }
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication required. No token provided.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        req.userData = {
            userId: decoded.userId,
            userType: decoded.userType
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userData) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }

    if (req.userData.userType !== 'admin') {
        res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
        return;
    }

    next();
};