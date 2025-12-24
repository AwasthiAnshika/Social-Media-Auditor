const healthService = require('../services/health.service');
const { sendSuccess } = require('../utils/response');

const check = async (req, res, next) => {
  try {
    const payload = await healthService.getStatus();

    sendSuccess(res, {
      message: 'OK',
      data: payload,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  check,
};
