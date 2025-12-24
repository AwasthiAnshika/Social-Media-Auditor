// Redis removed - cache not needed
// This stub is kept for backward compatibility with code that checks for redis existence
const redisClient = null;

const initRedis = async () => {
  // Redis removed - return null
  return null;
};

module.exports = {
  redisClient,
  initRedis,
};
