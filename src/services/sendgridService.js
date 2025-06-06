const sgMail = require('@sendgrid/mail');
const BaseEmailService = require('./baseEmailService');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');
const retry = require('../utils/retry');

class SendGridService extends BaseEmailService {
  constructor(config) {
    super(config);
    this.validateConfig();
    sgMail.setApiKey(config.apiKey);
    this.batchSize = config.batchSize || 1000;
  }

  validateConfig() {
    super.validateConfig();
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
    if (!this.config.from) {
      throw new Error('SendGrid from email address is required');
    }
  }

  async sendEmail(emailData) {
    const msg = {
      to: emailData.email,
      from: this.config.from,
      templateId: this.config.templateId,
      dynamicTemplateData: emailData
    };

    try {
      const response = await retry(
        () => sgMail.send(msg),
        {
          maxAttempts: this.config.retryAttempts,
          initialDelay: this.config.retryDelay,
          shouldRetry: (error) => {
            // Retry on rate limits and temporary failures
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
    logger.info(`Starting to send ${recipients.length} emails using SendGrid`);
    metrics.reset();

    for (let i = 0; i < recipients.length; i += this.batchSize) {
      const batch = recipients.slice(i, i + this.batchSize);
      logger.info(`Preparing batch of ${batch.length} emails`);
      
      metrics.startBatch();

      const messages = batch.map(recipient => ({
        to: recipient.email,
        from: this.config.from,
        templateId: this.config.templateId,
        dynamicTemplateData: recipient
      }));

      try {
        await retry(
          () => sgMail.sendMultiple(messages),
          {
            maxAttempts: this.config.retryAttempts,
            initialDelay: this.config.retryDelay,
            shouldRetry: (error) => {
              return error.code === 429 || (error.code >= 500 && error.code < 600);
            }
          }
        );

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
    logger.info('Finished sending bulk emails with SendGrid');
  }

  async sendBatch(batch, options = {}) {
    const messages = batch.map(recipient => ({
      to: recipient.email,
      from: this.config.from,
      templateId: options.templateId || this.config.templateId,
      dynamicTemplateData: recipient.data || {}
    }));

    try {
      await this.retry(
        () => sgMail.send(messages),
        this.config.retryAttempts || 3,
        this.config.retryDelay || 1000
      );
    } catch (error) {
      logger.error('SendGrid API error:', error);
      throw error;
    }
  }
}

module.exports = SendGridService;