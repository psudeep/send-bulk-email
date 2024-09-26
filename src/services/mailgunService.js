const mailgun = require('mailgun-js');
const logger = require('../utils/logger');

class MailgunService {
  constructor() {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
    this.batchSize = 1000; // Mailgun recommends not exceeding 1000 recipients per API call
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using Mailgun`);

    for (let i = 0; i < recipients.length; i += this.batchSize) {
      const batch = recipients.slice(i, i + this.batchSize);
      logger.info(`Preparing batch of ${batch.length} emails`);

      const data = {
        from: process.env.FROM_EMAIL_ID,
        to: batch.map(r => r.email),
        subject: 'Bulk Email Test',
        html: 'Hello %recipient.name%, <p>This is a test email.</p>',
        'recipient-variables': batch.reduce((acc, r) => {
          acc[r.email] = { name: r.name };
          return acc;
        }, {})
      };

      try {
        await new Promise((resolve, reject) => {
          this.mg.messages().send(data, (error, body) => {
            if (error) {
              logger.error(`Error sending batch of emails:`, error);
              reject(error);
            } else {
              logger.info(`Successfully sent batch of ${batch.length} emails`);
              resolve(body);
            }
          });
        });
      } catch (error) {
        // Here you might want to implement some error handling or retry logic
      }

      // Optional: Add a delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('Finished sending bulk emails with Mailgun');
  }
}

module.exports = new MailgunService();