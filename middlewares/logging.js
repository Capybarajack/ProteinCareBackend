const logger = require('../config/logger');

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const logLevel = status >= 400 ? 'error' : 'info';
    
    if (process.env.NODE_ENV === 'development' || logLevel === 'error') {
      logger[logLevel](
        `${req.method} ${req.originalUrl} ${status} ${duration}ms`
      );
    }
  });
  next();
};

module.exports = loggingMiddleware;