/*
Steps to call this API
`node sendEmailSendGrid.js prashant.sudeep@medimojo.in mailinglist.csv`
Arguement 1 is the from email ID and 2 is the file name in the same directory as code with name and email IDs to people whom mailer has to be  sent.
*/

const mailgun = require('mailgun-js')({
  apiKey: process.env.APIKEY,
  domain: process.env.DOMAIN_NAME,
});

const _ = require('lodash');
const moment = require('moment');
const csv = require('csvtojson');
require('dotenv').config();

const params = process.argv;
const fromEmail = params[2];
const csvFile = params[3];

const currentPath = process.cwd();

console.log('fromEmail', fromEmail);
console.log('csvFile', csvFile);


sendEmailMailgun = (fromEmail, emailId, emailBody, subject) => new Promise((resolve, reject) => {
  const data = {
    from: process.env.FROM_EMAIL_ID,
    to: emailId,
    subject,
    html: emailBody,
    custom_variable1: 'diwali_mailer',
    custom_variable2: {team: 'medimojo_diwali', platform: 'custom_code'},
  };
  mailgun.messages().send(data, (err, body) => {
    if(err) {
      console.error('[mailGun][sendMail]: error while triggering email', err);
      return reject(err);
    }
    return resolve(body);
  });
});

const csvFilePath = currentPath + '/' + csvFile;

console.log('csvFilePath', csvFilePath);

csv()
.fromFile(csvFilePath)
  .then((jsonObj)=>{
    console.log(jsonObj);
    jsonObj.map((i) => {
      const SUBJECT = `Hi ${i.name} - Wish you Happy Diwali`;
      const emailId = i.email;
      console.log('emailId', emailId, 'subject', SUBJECT);
      const HTML_BODY = `
        Hi ${i.name},<br/><br/>
        Wishing you a happy and blessed Diwali!<br/>
        May the lamps of joy, illuminate your life and fill your days with the bright sparkles of peace, mirth and goodwill. <br/>May the light of joy and prosperity shine on you this diwali. <br/>
        And throughout comming year. "HAPPY DIWALI" To you & your family<br/><br/>
        best regards,<br/>
        Medimojo Team.
      `;
      sendEmail(fromEmail, emailId, 'Hi', SUBJECT).then(() => {
        console.log('success:sent:::==', i.name);
      })
        .catch((e) => {
          console.log('error', e);
        });
    });
});
