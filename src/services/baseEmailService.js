const EmailServiceInterface = require('./emailServiceInterface');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class BaseEmailService extends EmailServiceInterface {
  constructor(config) {
    super();
    this.config = config;
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config) {
      throw new Error('Configuration is required');
    }
  }

  async sendBulkEmails(recipients, options = {}) {
    const startTime = Date.now();
    const batchSize = this.config.batchSize || 100;
    const batchDelay = this.config.batchDelay || 1000;
    const retryAttempts = this.config.retryAttempts || 3;
    const retryDelay = this.config.retryDelay || 1000;

    const batches = this.createBatches(recipients, batchSize);
    const results = {
      totalEmails: recipients.length,
      successfulEmails: 0,
      failedEmails: 0,
      failedRecipients: [],
      batches: {
        total: batches.length,
        successful: 0,
        failed: 0
      }
    };

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let batchSuccess = true;

      try {
        await this.sendBatch(batch, options);
        results.successfulEmails += batch.length;
        results.batches.successful++;
      } catch (error) {
        batchSuccess = false;
        results.failedEmails += batch.length;
        results.batches.failed++;
        results.failedRecipients.push(...batch.map(r => r.email));
        logger.error(`Batch ${i + 1} failed:`, error);
      }

      // Update metrics
      metrics.recordBatch({
        size: batch.length,
        success: batchSuccess,
        processingTime: Date.now() - startTime
      });

      // Add delay between batches if not the last batch
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    return results;
  }

  createBatches(recipients, batchSize) {
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }
    return batches;
  }

  async sendBatch(batch, options) {
    throw new Error('sendBatch method must be implemented by child class');
  }

  async retry(operation, maxAttempts, delay) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  async sendEmail(emailData) {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseEmailService; 