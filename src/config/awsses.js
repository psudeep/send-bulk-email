module.exports = {
  apiKey: process.env.AWS_ACCESS_KEY_ID,
  secretKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  from: process.env.AWS_SES_FROM_EMAIL,
  batchSize: parseInt(process.env.BATCH_SIZE) || 100,
  batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
}; 