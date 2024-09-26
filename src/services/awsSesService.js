const AWS = require('aws-sdk');
const logger = require('../utils/logger');

class AwsSesService {
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
    this.batchSize = 50; // SES allows up to 50 destinations per SendBulkTemplatedEmail call
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using AWS SES`);

    for (let i = 0; i < recipients.length; i += this.batchSize) {
      const batch = recipients.slice(i, i + this.batchSize);
      logger.info(`Preparing batch of ${batch.length} emails`);

      const params = {
        Destinations: batch.map(recipient => ({
          Destination: { ToAddresses: [recipient.email] },
          ReplacementTemplateData: JSON.stringify({ name: recipient.name })
        })),
        Source: process.env.FROM_EMAIL_ID,
        Template: process.env.AWS_SES_TEMPLATE_NAME,
        DefaultTemplateData: JSON.stringify({ name: 'Valued Customer' })
      };

      try {
        const result = await this.ses.sendBulkTemplatedEmail(params).promise();
        logger.info(`Successfully sent batch of ${batch.length} emails`);
        logger.debug('SES Response:', result);
      } catch (error) {
        logger.error(`Error sending batch of emails:`, error);
        // Implement error handling or retry logic here
      }

      // Optional: Add a delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info('Finished sending bulk emails with AWS SES');
  }
}

module.exports = new AwsSesService();