const Joi = require('joi');

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: null,
      meta: { details: error.details.map((d) => d.message) },
    });
  }

  req[property] = value;
  return next();
};

module.exports = {
  validate,
  Joi,
};
