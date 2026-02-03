const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err || {};

  // If it's not our ApiError, normalize.
  if (!(err instanceof ApiError)) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'An unexpected error occurred';
  }

  // Defensive: never allow undefined/invalid status codes.
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = errorHandler;