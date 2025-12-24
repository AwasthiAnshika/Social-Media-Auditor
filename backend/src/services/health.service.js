const getStatus = async () => {
  const checks = {
    db: 'unknown',
    cache: 'unknown',
  };

  // Database check disabled - Prisma removed
  checks.db = 'unknown';
  
  // Cache check disabled - Redis removed
  checks.cache = 'unknown';

  return {
    status: 'up',
    checks,
  };
};

module.exports = {
  getStatus,
};
