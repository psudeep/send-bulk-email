require('dotenv').config();

module.exports = {
  apiKey: process.env.SENDGRID_API_KEY,
  from: process.env.SENDGRID_FROM_EMAIL,
  templateId: process.env.SENDGRID_TEMPLATE_ID,
  batchSize: 1000,
  batchDelay: 1000, // 1 second delay between batches
  retryAttempts: 3,
  retryDelay: 1000, // 1 second delay between retries
  timeout: 10000 // 10 seconds timeout for API calls
}; 