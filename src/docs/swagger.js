const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bulk Email API',
      version: '1.0.0',
      description: 'API for sending bulk emails using various email service providers',
      license: {
        name: 'GNU General Public License (GPL)',
        url: 'https://www.gnu.org/licenses/gpl-3.0.en.html',
      },
      contact: {
        name: 'API Support',
        email: 'prashant.sudeep89@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Recipient: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Recipient email address',
            },
            name: {
              type: 'string',
              description: 'Recipient name',
            },
          },
        },
        EmailResponse: {
          type: 'object',
          properties: {
            successful: {
              type: 'number',
              description: 'Number of successfully sent emails',
            },
            failed: {
              type: 'number',
              description: 'Number of failed email attempts',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  recipient: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                      },
                      name: {
                        type: 'string',
                      },
                    },
                  },
                  error: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs; 