const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.batchSize = 1000; // SendGrid allows up to 1000 recipients per API call
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using SendGrid`);

    for (let i = 0; i < recipients.length; i += this.batchSize) {
      const batch = recipients.slice(i, i + this.batchSize);
      logger.info(`Preparing batch of ${batch.length} emails`);

      const messages = batch.map(recipient => ({
        to: recipient.email,
        from: process.env.FROM_EMAIL_ID,
        subject: `Hello ${recipient.name}`,
        html: `<p>Hello ${recipient.name},</p><p>This is a test email.</p>`,
      }));

      try {
        await sgMail.sendMultiple(messages);
        logger.info(`Successfully sent batch of ${batch.length} emails`);
      } catch (error) {
        logger.error(`Error sending batch of emails:`, error);
        // Here you might want to implement some error handling or retry logic
      }

      // Optional: Add a delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('Finished sending bulk emails with SendGrid');
  }
}

module.exports = new SendgridService();