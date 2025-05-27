require('dotenv').config();

module.exports = {
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  from: process.env.MAILGUN_FROM_EMAIL,
  batchSize: parseInt(process.env.BATCH_SIZE) || 100,
  batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
  timeout: 10000 // 10 seconds timeout for API calls
}; 