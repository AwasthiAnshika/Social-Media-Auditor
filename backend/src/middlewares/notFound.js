const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  sendError(res, { statusCode: 404, message: 'Not found' });
};

module.exports = notFound;
