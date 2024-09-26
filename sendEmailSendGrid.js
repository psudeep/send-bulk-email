const sgMail = require('@sendgrid/mail');
const csv = require('csvtojson');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

// Set SendGrid API key
sgMail.setApiKey(config.SENDGRID_API_KEY);

// Function to read and parse CSV file
async function readCSV(filePath) {
  try {
    const jsonArray = await csv().fromFile(filePath);
    // Validate that required fields are present
    const missingFields = config.CSV_REQUIRED_FIELDS.filter(field => !jsonArray[0].hasOwnProperty(field));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in CSV: ${missingFields.join(', ')}`);
    }
    return jsonArray;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
}

// Function to read email template
async function readEmailTemplate(templatePath) {
  try {
    const template = await fs.readFile(templatePath, 'utf-8');
    return template;
  } catch (error) {
    console.error('Error reading email template:', error);
    throw error;
  }
}

// Function to send a batch of emails
async function sendEmailBatch(batch, emailTemplate) {
  const messages = batch.map(recipient => ({
    to: recipient.email,
    from: config.FROM_EMAIL,
    subject: config.SUBJECT,
    html: emailTemplate.replace('{{NAME}}', recipient.name), // Personalize email
  }));

  try {
    const result = await sgMail.send(messages);
    return { success: messages.length, failed: 0 };
  } catch (error) {
    console.error('Error sending email batch:', error);
    if (error.response && error.response.body && error.response.body.errors) {
      const failedCount = error.response.body.errors.length;
      return { success: messages.length - failedCount, failed: failedCount };
    }
    return { success: 0, failed: messages.length };
  }
}

// Main function to orchestrate the email sending process
async function sendBulkEmails(csvFilePath) {
  console.log('Starting bulk email process...');

  try {
    // Read CSV and email template
    const recipients = await readCSV(csvFilePath);
    const emailTemplate = await readEmailTemplate(config.TEMPLATE_PATH);

    console.log(`Loaded ${recipients.length} recipients from CSV.`);

    let totalSent = 0;
    let totalFailed = 0;

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += config.BATCH_SIZE) {
      const batch = recipients.slice(i, i + config.BATCH_SIZE);
      console.log(`Sending batch ${Math.floor(i / config.BATCH_SIZE) + 1}...`);

      const { success, failed } = await sendEmailBatch(batch, emailTemplate);
      totalSent += success;
      totalFailed += failed;

      console.log(`Batch result: ${success} sent, ${failed} failed.`);

      // Implement rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000 / config.RATE_LIMIT.MAX_REQUESTS_PER_SECOND));
    }

    console.log('\nEmail sending process completed.');
    console.log(`Total emails sent: ${totalSent}`);
    console.log(`Total emails failed: ${totalFailed}`);

  } catch (error) {
    console.error('An error occurred during the email sending process:', error);
  }
}

// Script entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.log('Usage: node sendEmailSendGrid.js <csv_file_path>');
    process.exit(1);
  }

  const csvFilePath = path.resolve(process.cwd(), args[0]);
  sendBulkEmails(csvFilePath);
}

module.exports = { sendBulkEmails }; // Export for potential use as a module