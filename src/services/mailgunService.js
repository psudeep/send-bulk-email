const mailgun = require('mailgun-js');
const logger = require('../utils/logger');

class MailgunService {
  constructor() {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
  }

  async sendEmail(to, subject, html) {
    const data = {
      from: process.env.FROM_EMAIL_ID,
      to,
      subject,
      html,
    };

    return new Promise((resolve, reject) => {
      this.mg.messages().send(data, (error, body) => {
        if (error) {
          logger.error(`Error sending email to ${to}:`, error);
          reject(error);
        } else {
          logger.info(`Email sent successfully to ${to}`);
          resolve(body);
        }
      });
    });
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using Mailgun`);

    for (const recipient of recipients) {
      try {
        const subject = `Hello ${recipient.name}`;
        const html = `<p>Hello ${recipient.name},</p><p>This is a test email.</p>`;
        await this.sendEmail(recipient.email, subject, html);
      } catch (error) {
        logger.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }

    logger.info('Finished sending bulk emails with Mailgun');
  }
}

module.exports = new MailgunService();