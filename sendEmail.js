/*
Steps to call this API
`node sendDiwaliEmail.js prashant.sudeep@medimojo.in sipumailinglist.csv`
Arguement 1 is the from email ID and 2 is the file name in the same directory as code with name and email IDs to people whom mailer has to be  sent.
*/

const mailgun = require('mailgun-js')({
  apiKey: 'APIKEY',
  domain: 'DOMAIN_NAME',
});

const _ = require('lodash');
const moment = require('moment');
const csv = require('csvtojson');

const params = process.argv;
const fromEmail = params[2];
const csvFile = params[3];

const currentPath = process.cwd();

console.log('fromEmail', fromEmail);
console.log('csvFile', csvFile);


sendEmailMailgun = (fromEmail, emailId, emailBody, subject) => new Promise((resolve, reject) => {
  const data = {
    from: fromEmail,
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
      sendEmail(fromEmail, emailId, 'Hi', SUBJECT).then(() => {
        console.log('success:sent:::==', i.name);
      })
        .catch((e) => {
          console.log('error', e);
        });
    });
});
