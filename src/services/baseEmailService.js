const EmailServiceInterface = require('./emailServiceInterface');
const logger = require('../utils/logger');

class BaseEmailService extends EmailServiceInterface {
  constructor(config) {
    super();
    this.config = config;
    this.validateConfig(config);
  }

  validateConfig(config) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.from) {
      throw new Error('From email address is required');
    }
  }

  async sendBulkEmails(recipients, config) {
    const batchSize = config.batchSize || 100;
    const batches = this.createBatches(recipients, batchSize);
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const batch of batches) {
      try {
        await this.processBatch(batch, config, results);
        // Add delay between batches to prevent rate limiting
        await this.delay(config.batchDelay || 1000);
      } catch (error) {
        logger.error('Error processing batch:', error);
        results.failed += batch.length;
        results.errors.push({
          batch: batch,
          error: error.message
        });
      }
    }

    return results;
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async processBatch(batch, config, results) {
    const promises = batch.map(recipient => 
      this.sendEmail(recipient, config)
        .then(() => {
          results.successful++;
        })
        .catch(error => {
          results.failed++;
          results.errors.push({
            recipient,
            error: error.message
          });
        })
    );

    await Promise.all(promises);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendEmail(emailData) {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseEmailService; 