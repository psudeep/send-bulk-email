# Bulk Email Sender

A robust Node.js application for sending bulk emails using multiple email service providers (SendGrid, Mailgun, AWS SES). The application includes features like batch processing, retry mechanisms, metrics collection, and comprehensive error handling.

## Features

- Multiple email service provider support (SendGrid, Mailgun, AWS SES)
- Batch processing with configurable batch sizes
- Automatic retry mechanism with exponential backoff
- Comprehensive metrics and monitoring
- Input validation and error handling
- API documentation with Swagger
- Test coverage with Jest

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Email service provider accounts (SendGrid, Mailgun, or AWS SES)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/send-bulk-email.git
cd send-bulk-email
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your configuration:
```env
# Email Service Configuration
EMAIL_SERVICE=sendgrid  # or mailgun, awsses
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@example.com
SENDGRID_TEMPLATE_ID=your_template_id

# Optional Configuration
BATCH_SIZE=1000
BATCH_DELAY=1000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
```

## Usage

### Command Line

Send emails using SendGrid:
```bash
npm run send:sendgrid -- path/to/recipients.csv
```

Send emails using Mailgun:
```bash
npm run send:mailgun -- path/to/recipients.csv
```

### CSV Format

The recipients CSV file should have the following format:
```csv
email,name
recipient1@example.com,John Doe
recipient2@example.com,Jane Smith
```

### API Usage

Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`.

#### API Endpoints

1. Send Bulk Emails
```http
POST /api/v1/emails/bulk
Content-Type: application/json

{
  "recipients": [
    {
      "email": "recipient1@example.com",
      "name": "John Doe"
    },
    {
      "email": "recipient2@example.com",
      "name": "Jane Smith"
    }
  ],
  "templateId": "your_template_id"
}
```

2. Get Metrics
```http
GET /api/v1/metrics
```

## API Documentation

Access the Swagger documentation at `http://localhost:3000/api-docs` when the server is running.

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Code Style

```bash
# Run linter
npm run lint
```

## Architecture

The application follows a modular architecture:

```
src/
├── config/         # Configuration files
├── services/       # Email service implementations
├── utils/          # Utility functions
├── routes/         # API routes
├── tests/          # Test files
└── docs/           # Documentation
```

### Key Components

1. **Email Services**
   - `EmailServiceInterface`: Base interface for email services
   - `BaseEmailService`: Common functionality for all email services
   - Provider-specific implementations (SendGrid, Mailgun, AWS SES)

2. **Utilities**
   - `Validator`: Input validation
   - `Metrics`: Performance monitoring
   - `Retry`: Retry mechanism with exponential backoff

3. **Configuration**
   - Environment-based configuration
   - Service-specific settings
   - Batch processing parameters

## Error Handling

The application implements comprehensive error handling:

- Input validation errors
- Service provider errors
- Rate limiting handling
- Retry mechanism for transient failures
- Detailed error logging

## Monitoring

Metrics are collected for:

- Total emails sent
- Success/failure rates
- Batch processing times
- Error tracking
- Performance monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License (GPL) - see the LICENSE file for details.

## Support

For support, email support@example.com or open an issue in the GitHub repository.