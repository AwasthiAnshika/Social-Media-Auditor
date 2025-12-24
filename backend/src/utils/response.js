const buildResponse = ({ success, message, data = null, meta = null }) => ({
  success,
  message,
  data,
  meta,
});

const sendSuccess = (res, { message = 'OK', data = null, meta = null }, statusCode = 200) => {
  res.status(statusCode).json(
    buildResponse({
      success: true,
      message,
      data,
      meta,
    }),
  );
};

const sendError = (res, { statusCode = 500, message = 'Something went wrong', data = null, meta = null }) => {
  res.status(statusCode).json(
    buildResponse({
      success: false,
      message,
      data,
      meta,
    }),
  );
};

module.exports = {
  buildResponse,
  sendSuccess,
  sendError,
};
