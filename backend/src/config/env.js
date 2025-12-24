const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  apifyInstagramApiToken: process.env.APIFY_INSTA_API_TOKEN || '',
  apifyTiktokApiToken: process.env.APIFY_TIKTOK_API_TOKEN || '',
};

module.exports = env;
