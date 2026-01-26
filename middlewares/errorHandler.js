const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = 'An unexpected error occurred';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};

module.exports = errorHandler;