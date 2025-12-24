const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Unexpected error';
  const meta = err.meta || null;

  sendError(res, { statusCode, message, meta });
};

module.exports = errorHandler;
