const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
require('express-async-errors');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const loggingMiddleware = require('./middlewares/logging');
const errorHandler = require('./middlewares/errorHandler');
const emailService = require('./services/emailService');
const passport = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimit');
const routes = require('./routes');

const app = express();

// Logging middleware
app.use(loggingMiddleware);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

app.use(passport.initialize());

// limit rate for auth
if (config.env === 'production') {
  app.use('/api/auth', authLimiter);
}

// routes 關鍵就是這一行 http://localhost:1337/api/posts/
app.use('/api', routes);

// error handler
app.use(errorHandler);

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB');

    // Initialize email service
    await emailService.initializeEmailService();
    logger.info('Email service initialized');

    //await emailService.sendEmail('asdfg703703703@gmail.com' , '測試郵件', '<p>這是一封測試郵件。</p>');
    //logger.info('Test email sent successfully ');

    // Start the server
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Error during startup:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// handle unexpected errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  process.exit(0);
});