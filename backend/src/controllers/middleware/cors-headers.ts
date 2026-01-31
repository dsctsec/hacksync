import { Request, Response, NextFunction } from 'express';

// Middleware to add explicit CORS headers to all responses
export const addCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
    
    next();
};
