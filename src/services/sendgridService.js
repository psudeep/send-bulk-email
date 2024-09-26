const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to, subject, html) {
    const msg = {
      to,
      from: process.env.FROM_EMAIL_ID,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(recipients, config) {
    logger.info(`Starting to send ${recipients.length} emails using SendGrid`);

    for (const recipient of recipients) {
      try {
        const subject = `Hello ${recipient.name}`;
        const html = `<p>Hello ${recipient.name},</p><p>This is a test email.</p>`;
        await this.sendEmail(recipient.email, subject, html);
      } catch (error) {
        logger.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }

    logger.info('Finished sending bulk emails with SendGrid');
  }
}

module.exports = new SendgridService();