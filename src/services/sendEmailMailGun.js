// Load environment variables
require('dotenv').config();

// Import required modules
const mailgun = require('mailgun-js');
const csv = require('csvtojson');
const path = require('path');

// Initialize Mailgun client
const mg = mailgun({
  apiKey: process.env.APIKEY,
  domain: process.env.DOMAIN_NAME,
});

// Configuration
const CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL_ID,
  SUBJECT_TEMPLATE: 'Hi {{name}} - Wish you Happy Diwali',
  BATCH_SIZE: 100, // Number of emails to send in each batch
};

// Function to send email using Mailgun
function sendEmailMailgun(toEmail, subject, htmlBody) {
  return new Promise((resolve, reject) => {
    const data = {
      from: CONFIG.FROM_EMAIL,
      to: toEmail,
      subject: subject,
      html: htmlBody,
      'custom-variable-1': 'diwali_mailer',
      'custom-variable-2': JSON.stringify({ team: 'medimojo_diwali', platform: 'custom_code' }),
    };

    mg.messages().send(data, (error, body) => {
      if (error) {
        console.error('[mailGun][sendMail]: error while triggering email', error);
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}

// Function to generate email HTML body
function generateEmailBody(name) {
  return `
    Hi ${name},<br/><br/>
    Wishing you a happy and blessed Diwali!<br/>
    May the lamps of joy, illuminate your life and fill your days with the bright sparkles of peace, mirth and goodwill. <br/>May the light of joy and prosperity shine on you this diwali. <br/>
    And throughout coming year. "HAPPY DIWALI" To you & your family<br/><br/>
    Best regards,<br/>
    Medimojo Team.
  `;
}

// Function to send emails in batches
async function sendEmailBatch(batch) {
  const results = { success: 0, failed: 0 };

  for (const recipient of batch) {
    const subject = CONFIG.SUBJECT_TEMPLATE.replace('{{name}}', recipient.name);
    const htmlBody = generateEmailBody(recipient.name);

    try {
      await sendEmailMailgun(recipient.email, subject, htmlBody);
      results.success++;
      console.log(`Successfully sent email to ${recipient.name} (${recipient.email})`);
    } catch (error) {
      results.failed++;
      console.error(`Failed to send email to ${recipient.name} (${recipient.email}):`, error.message);
    }
  }

  return results;
}

// Main function to process CSV and send emails
async function processCSVAndSendEmails(csvFilePath) {
  try {
    console.log('Starting email sending process...');

    // Read CSV file
    const recipients = await csv().fromFile(csvFilePath);
    console.log(`Loaded ${recipients.length} recipients from CSV.`);

    let totalSent = 0;
    let totalFailed = 0;

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += CONFIG.BATCH_SIZE) {
      const batch = recipients.slice(i, i + CONFIG.BATCH_SIZE);
      console.log(`Sending batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}...`);

      const { success, failed } = await sendEmailBatch(batch);
      totalSent += success;
      totalFailed += failed;

      console.log(`Batch result: ${success} sent, ${failed} failed.`);
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
    console.log('Usage: node sendEmailMailgun.js <csv_file_path>');
    process.exit(1);
  }

  const csvFilePath = path.resolve(process.cwd(), args[0]);
  processCSVAndSendEmails(csvFilePath);
}

module.exports = { processCSVAndSendEmails }; // Export for potential use as a module