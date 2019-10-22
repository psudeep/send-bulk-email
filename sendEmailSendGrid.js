/*
Steps to call this API
`node sendEmailSendGrid.js prashant.sudeep@medimojo.in sipumailinglist.csv`
Arguement 1 is the from email ID and 2 is the file name in the same directory as code with name and email IDs to people whom mailer has to be  sent.
*/

const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const _ = require('lodash');
const moment = require('moment');
const csv = require('csvtojson');

const params = process.argv;
const fromEmail = params[2];
const csvFile = params[3];

const currentPath = process.cwd();

console.log('fromEmail', fromEmail);
console.log('csvFile', csvFile);

const sendEmailSg = (fromEmail, emailId, emailBody, subject) => new Promise((resolve, reject) => {
  //sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: emailId,
    from: fromEmail,
    subject,
    //text: 'and easy to do anywhere, even with Node.js',
    html: emailBody,
  };
  sgMail.send(msg).then((data) => {
    resolve(data);
  })
    .catch(e => reject(e));
});