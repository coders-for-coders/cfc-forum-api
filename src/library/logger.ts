import winston from 'winston';


const methodColors = {
  get: '\x1b[34m',
  post: '\x1b[32m',
  put: '\x1b[33m',
  delete: '\x1b[31m',
  patch: '\x1b[35m',
  default: '\x1b[37m'
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

/**
 * @description Winston logger
 * @returns The logger
 * @example
 * logger.info('Hello, world!');
 * logger.error('An error occurred');
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss - dd/mm' }),
    winston.format.colorize(),
    winston.format.printf((info: winston.Logform.TransformableInfo) => {
      return `[${info.level}] ${info.timestamp} ${info.message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

/**
 * @description Middleware to log requests
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method.toLowerCase();
    const color = methodColors[method as keyof typeof methodColors] || methodColors.default;
    const message = `${color}${BOLD}[${req.method}]${RESET} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.info(message);
    }
  });

  next();
};

export { BOLD, methodColors, RESET };

export default logger ;