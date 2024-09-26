# Bulk Email Sender Using Node.js and SendGrid

This project allows you to send bulk emails using Node.js and SendGrid. It includes features like batching, rate limiting, and customizable email templates.

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/psudeep/send-bulk-email.git bulk-email-sender
   cd bulk-email-sender
   ```

2. Install the required packages:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your SendGrid API key and sender email:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   FROM_EMAIL_ID=your_sender_email@example.com
   ```

4. Update the `config.js` file to customize settings such as batch size, email subject, and CSV required fields.

5. Prepare your CSV file with at least 'name' and 'email' columns. Place it in the project directory.

6. Create an HTML email template file (default: `email_template.html`) in the project directory.

## Usage

To send bulk emails:

```
npm run send:sendgrid -- ./data/mailinglist.csv
npm run send:mailgun -- ./data/mailinglist.csv
```

Replace `your_csv_file.csv` with the path to your CSV file containing recipient information.

## Customization

### Email Template

Create your HTML email template and update the `TEMPLATE_PATH` in `config.js`. Use `{{NAME}}` in the template to personalize emails with the recipient's name.

### Configuration

Modify `config.js` to adjust various settings:

- `BATCH_SIZE`: Number of emails to send in each batch
- `SUBJECT`: Email subject line
- `CSV_REQUIRED_FIELDS`: Required fields in the CSV file
- `RATE_LIMIT`: Adjust rate limiting settings
- `RETRY`: Configure retry attempts for failed emails

### Logging

Adjust the `LOG_LEVEL` in `config.js` to control the verbosity of logs.

## Features

- Batch sending of emails
- Rate limiting to comply with SendGrid's guidelines
- Customizable email templates
- CSV parsing with required field validation
- Detailed logging of the email sending process

## Support and Customization

For support, bug reports, or custom feature requests, please open an issue on the GitHub repository or contact the maintainer at prashant.sudeep89@gmail.com.

## License

[MIT License](LICENSE)