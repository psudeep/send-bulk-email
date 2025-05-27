const { isEmail } = require('validator');

class Validator {
  static validateEmail(email) {
    if (!email) {
      throw new Error('Email address is required');
    }
    if (!isEmail(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    return true;
  }

  static validateRecipient(recipient) {
    if (!recipient) {
      throw new Error('Recipient data is required');
    }

    const requiredFields = ['email', 'name'];
    const missingFields = requiredFields.filter(field => !recipient[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    this.validateEmail(recipient.email);
    
    if (typeof recipient.name !== 'string' || recipient.name.trim().length === 0) {
      throw new Error('Name must be a non-empty string');
    }

    return true;
  }

  static validateRecipients(recipients) {
    if (!Array.isArray(recipients)) {
      throw new Error('Recipients must be an array');
    }

    if (recipients.length === 0) {
      throw new Error('Recipients array cannot be empty');
    }

    const errors = [];
    recipients.forEach((recipient, index) => {
      try {
        this.validateRecipient(recipient);
      } catch (error) {
        errors.push({
          index,
          error: error.message
        });
      }
    });

    if (errors.length > 0) {
      throw new Error(`Invalid recipients found: ${JSON.stringify(errors)}`);
    }

    return true;
  }

  static validateTemplateData(templateData) {
    if (!templateData) {
      throw new Error('Template data is required');
    }

    if (typeof templateData !== 'object') {
      throw new Error('Template data must be an object');
    }

    return true;
  }
}

module.exports = Validator; 