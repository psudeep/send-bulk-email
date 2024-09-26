// src/index.js
require('dotenv').config();
const path = require('path');
const config = require('./config/config');
const getDataSource = require('./utils/dataSource');
const mailgunService = require('./services/mailgunService');
const sendgridService = require('./services/sendgridService');
const logger = require('./utils/logger');

const dataSource = getDataSource(config.dataSource);
const emailService = config.emailService === 'sendgrid' ? sendgridService : mailgunService;

async function main() {
  try {
    // Get CSV file path from command line arguments or use default
    const csvFilePath = process.argv[2] || path.join(__dirname, '..', 'data', 'mailinglist.csv');
    
    logger.info(`Using CSV file: ${csvFilePath}`);
    
    const recipients = await dataSource.getRecipients(csvFilePath);
    logger.info(`Loaded ${recipients.length} recipients from CSV`);
    
    await emailService.sendBulkEmails(recipients, config);
    
    logger.info('Email sending process completed');
  } catch (error) {
    logger.error('An error occurred during the email sending process:', error);
  }
}

main().catch(error => {
  logger.error('Unhandled error in main function:', error);
  process.exit(1);
});