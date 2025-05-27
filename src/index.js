// src/index.js
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');
const emailRoutes = require('./routes/emailRoutes');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/v1/emails', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      sendgrid: {
        configured: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'not configured'
      },
      mailgun: {
        configured: !!process.env.MAILGUN_API_KEY,
        fromEmail: process.env.MAILGUN_FROM_EMAIL || 'not configured'
      },
      awsses: {
        configured: !!process.env.AWS_ACCESS_KEY_ID,
        fromEmail: process.env.AWS_SES_FROM_EMAIL || 'not configured'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`API documentation available at http://localhost:${port}/api-docs`);
  logger.info(`Health check available at http://localhost:${port}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});