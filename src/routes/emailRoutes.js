const express = require('express');
const router = express.Router();
const Validator = require('../utils/validator');
const metrics = require('../utils/metrics');
const SendGridService = require('../services/sendgridService');
const MailgunService = require('../services/mailgunService');
const AwsSesService = require('../services/awsSesService');
const logger = require('../utils/logger');

// Initialize services lazily
let sendgridService = null;
let mailgunService = null;
let awsSesService = null;

const getEmailService = (service) => {
  switch (service) {
    case 'sendgrid':
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key is not configured');
      }
      if (!sendgridService) {
        const config = {
          apiKey: process.env.SENDGRID_API_KEY,
          from: process.env.SENDGRID_FROM_EMAIL,
          templateId: process.env.SENDGRID_TEMPLATE_ID,
          batchSize: parseInt(process.env.BATCH_SIZE) || 100,
          batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
          retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
        };
        sendgridService = new SendGridService(config);
      }
      return sendgridService;
    case 'mailgun':
      if (!process.env.MAILGUN_API_KEY) {
        throw new Error('Mailgun API key is not configured');
      }
      if (!mailgunService) {
        const config = {
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          from: process.env.MAILGUN_FROM_EMAIL,
          batchSize: parseInt(process.env.BATCH_SIZE) || 100,
          batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
          retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
        };
        mailgunService = new MailgunService(config);
      }
      return mailgunService;
    case 'awsses':
      if (!process.env.AWS_ACCESS_KEY_ID) {
        throw new Error('AWS credentials are not configured');
      }
      if (!awsSesService) {
        const config = {
          apiKey: process.env.AWS_ACCESS_KEY_ID,
          secretKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
          from: process.env.AWS_SES_FROM_EMAIL,
          batchSize: parseInt(process.env.BATCH_SIZE) || 100,
          batchDelay: parseInt(process.env.BATCH_DELAY) || 1000,
          retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3,
          retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
        };
        awsSesService = new AwsSesService(config);
      }
      return awsSesService;
    default:
      throw new Error('Invalid email service');
  }
};

/**
 * @swagger
 * /api/v1/emails/bulk:
 *   post:
 *     summary: Send bulk emails
 *     description: Send emails to multiple recipients using the specified email service
 *     tags: [Emails]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipients
 *               - service
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Recipient'
 *               service:
 *                 type: string
 *                 enum: [sendgrid, mailgun, awsses]
 *                 description: Email service provider to use
 *               templateId:
 *                 type: string
 *                 description: Template ID for the email service
 *     responses:
 *       200:
 *         description: Emails sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailResponse'
 *       400:
 *         description: Invalid input or service not configured
 *       500:
 *         description: Server error
 */
router.post('/bulk', async (req, res) => {
  try {
    const { recipients, service, templateId } = req.body;

    // Validate input
    Validator.validateRecipients(recipients);

    // Get email service
    let emailService;
    try {
      emailService = getEmailService(service);
    } catch (error) {
      return res.status(400).json({ 
        error: error.message,
        message: 'Please configure the email service credentials in your .env file'
      });
    }

    // Send emails
    const result = await emailService.sendBulkEmails(recipients, { templateId });

    res.json(result);
  } catch (error) {
    logger.error('Error sending bulk emails:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/emails/services:
 *   get:
 *     summary: Get available email services
 *     description: Get a list of configured email services
 *     tags: [Emails]
 *     responses:
 *       200:
 *         description: List of configured services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       configured:
 *                         type: boolean
 */
router.get('/services', (req, res) => {
  const services = [
    {
      name: 'sendgrid',
      configured: !!process.env.SENDGRID_API_KEY
    },
    {
      name: 'mailgun',
      configured: !!process.env.MAILGUN_API_KEY
    },
    {
      name: 'awsses',
      configured: !!process.env.AWS_ACCESS_KEY_ID
    }
  ];

  res.json({ services });
});

/**
 * @swagger
 * /api/v1/metrics:
 *   get:
 *     summary: Get email sending metrics
 *     description: Retrieve metrics about email sending performance
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalEmails:
 *                   type: number
 *                 successfulEmails:
 *                   type: number
 *                 failedEmails:
 *                   type: number
 *                 successRate:
 *                   type: number
 *                 totalBatches:
 *                   type: number
 *                 successfulBatches:
 *                   type: number
 *                 failedBatches:
 *                   type: number
 *                 batchSuccessRate:
 *                   type: number
 *                 averageBatchProcessingTime:
 *                   type: number
 */
router.get('/metrics', (req, res) => {
  const currentMetrics = metrics.getMetrics();
  res.json(currentMetrics);
});

module.exports = router; 