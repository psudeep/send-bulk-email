const express = require('express');
const router = express.Router();
const Validator = require('../utils/validator');
const metrics = require('../utils/metrics');
const sendgridService = require('../services/sendgridService');
const mailgunService = require('../services/mailgunService');
const awsSesService = require('../services/awsSesService');

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
 *         description: Invalid input
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
    switch (service) {
      case 'sendgrid':
        emailService = sendgridService;
        break;
      case 'mailgun':
        emailService = mailgunService;
        break;
      case 'awsses':
        emailService = awsSesService;
        break;
      default:
        return res.status(400).json({ error: 'Invalid email service' });
    }

    // Send emails
    const result = await emailService.sendBulkEmails(recipients, { templateId });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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