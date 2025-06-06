require('dotenv').config();

module.exports = {
  apiKey: process.env.SENDGRID_API_KEY,
  from: process.env.SENDGRID_FROM_EMAIL,
  templateId: process.env.SENDGRID_TEMPLATE_ID,
  batchSize: parseInt(process.env.BATCH_SIZE) || 100,
  batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY) || 1000,
  timeout: 10000 // 10 seconds timeout for API calls
}; 