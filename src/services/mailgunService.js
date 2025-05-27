const mailgun = require('mailgun-js');
const BaseEmailService = require('./baseEmailService');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');
const retry = require('../utils/retry');

class MailgunService extends BaseEmailService {
  constructor(config) {
    super(config);
    this.config = config;
    this.mailgun = null;
  }

  validateConfig(config) {
    super.validateConfig(config);
    if (!config.domain) {
      throw new Error('Domain is required for Mailgun');
    }
  }

  initialize() {
    if (!this.mailgun) {
      this.validateConfig(this.config);
      this.mailgun = mailgun({
        apiKey: this.config.apiKey,
        domain: this.config.domain
      });
    }
    return this.mailgun;
  }

  async sendEmail(emailData) {
    const mailgun = this.initialize();
    const msg = {
      to: emailData.email,
      from: this.config.from,
      subject: emailData.subject || 'Hello',
      text: emailData.text,
      html: emailData.html
    };

    try {
      const response = await retry(
        () => mailgun.messages().send(msg),
        {
          maxAttempts: this.config.retryAttempts,
          initialDelay: this.config.retryDelay,
          shouldRetry: (error) => {
            return error.code === 429 || (error.code >= 500 && error.code < 600);
          }
        }
      );

      metrics.recordEmail(true);
      logger.info(`Email sent successfully to ${emailData.email}`);
      return response;
    } catch (error) {
      metrics.recordEmail(false, error);
      logger.error(`Failed to send email to ${emailData.email}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using Mailgun`);
    metrics.reset();

    for (let i = 0; i < recipients.length; i += this.config.batchSize) {
      const batch = recipients.slice(i, i + this.config.batchSize);
      logger.info(`Preparing batch of ${batch.length} emails`);
      
      metrics.startBatch();

      try {
        const promises = batch.map(recipient => this.sendEmail(recipient));
        await Promise.all(promises);
        
        metrics.endBatch(true);
        logger.info(`Successfully sent batch of ${batch.length} emails`);
      } catch (error) {
        metrics.endBatch(false, error);
        logger.error(`Error sending batch of emails:`, error);
      }

      // Add delay between batches to avoid rate limiting
      await this.delay(this.config.batchDelay);
    }

    metrics.logMetrics();
    logger.info('Finished sending bulk emails with Mailgun');
  }
}

// Export the class instead of an instance
module.exports = MailgunService;