class EmailServiceInterface {
  /**
   * Send a single email
   * @param {Object} emailData - The email data
   * @param {string} emailData.to - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.text - Plain text content
   * @param {string} emailData.html - HTML content
   * @returns {Promise<Object>} - Response from the email service
   */
  async sendEmail(emailData) {
    throw new Error('Method not implemented');
  }

  /**
   * Send bulk emails
   * @param {Array<Object>} recipients - Array of recipient data
   * @param {Object} config - Configuration object
   * @returns {Promise<Object>} - Response from the email service
   */
  async sendBulkEmails(recipients, config) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate email service configuration
   * @param {Object} config - Configuration object
   * @returns {boolean} - Whether the configuration is valid
   */
  validateConfig(config) {
    throw new Error('Method not implemented');
  }
}

module.exports = EmailServiceInterface; 