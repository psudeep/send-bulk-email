# Bulk Email Using MailGun #

This README would normally document whatever steps are necessary to get your code.

### Steps for running & customizing this code ###

* Clone this code/repo: `git clone git@github.com:psudeep/send-bulk-email.git`
* Install the packages: `npm install`
* Add your Mailgun API Key and domain name in the `.env` file and then it will use it as config
* Update your the mailling list in the format shared as mailinglist.csv
* Your can change your email Subject: `SUBJECT` variable in the code
* You should create your html template from somewhere and change in the HTML_TEMPLATE variable


### Steps for Sending email

* Once all the changes are made.
* Mailing list, subject and email template is updated, follow the below commands
* `node sendEmail.js prashant@medimojo.in mailinglist.csv`
* Make sure your maling list and code are in the same directory.

### Support (Help/Customization) ###

* If you want any changes and customization, please write to me at `prashant.sudeep89@gmail.com`
* If you want SENDGRID code for this instead of mailgun, drop an email to me.