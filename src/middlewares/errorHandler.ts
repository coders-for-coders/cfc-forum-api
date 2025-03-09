import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).json({
        error: isProduction ? "Internal Server Error" : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
};