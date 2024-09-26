// config.js

require('dotenv').config();

const config = {
  // SendGrid configuration
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL_ID,

  // Email sending configuration
  BATCH_SIZE: 100, // Number of emails to send in each batch
  SUBJECT: 'Your email subject here',
  TEMPLATE_PATH: './email_template.html', // Path to your email template

  // CSV file configuration
  CSV_REQUIRED_FIELDS: ['name', 'email'], // Fields that must be present in the CSV

  // Logging configuration
  LOG_LEVEL: 'info', // Options: 'error', 'warn', 'info', 'debug'

  // Rate limiting (to avoid hitting SendGrid's rate limits)
  RATE_LIMIT: {
    MAX_REQUESTS_PER_SECOND: 5,
    MAX_CONCURRENT_BATCHES: 3
  },

  // Retry configuration for failed emails
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000 // Delay between retries in milliseconds
  }
};

module.exports = config;