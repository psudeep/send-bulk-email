const SendGridService = require('../services/sendgridService');
const sgMail = require('@sendgrid/mail');

// Mock SendGrid
jest.mock('@sendgrid/mail');

describe('SendGridService', () => {
  let service;
  const mockConfig = {
    apiKey: 'test-api-key',
    from: 'test@example.com',
    templateId: 'test-template-id',
    batchSize: 2
  };

  beforeEach(() => {
    service = new SendGridService(mockConfig);
    jest.clearAllMocks();
  });

  describe('validateConfig', () => {
    it('should throw error if apiKey is missing', () => {
      expect(() => {
        service.validateConfig({ from: 'test@example.com', templateId: 'test' });
      }).toThrow('API key is required');
    });

    it('should throw error if from email is missing', () => {
      expect(() => {
        service.validateConfig({ apiKey: 'test', templateId: 'test' });
      }).toThrow('From email address is required');
    });

    it('should throw error if templateId is missing', () => {
      expect(() => {
        service.validateConfig({ apiKey: 'test', from: 'test@example.com' });
      }).toThrow('Template ID is required for SendGrid');
    });
  });

  describe('sendEmail', () => {
    const mockEmailData = {
      email: 'recipient@example.com',
      name: 'Test User'
    };

    it('should send email successfully', async () => {
      sgMail.send.mockResolvedValueOnce([{ statusCode: 202 }]);

      await service.sendEmail(mockEmailData);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: mockEmailData.email,
        from: mockConfig.from,
        templateId: mockConfig.templateId,
        dynamicTemplateData: mockEmailData
      });
    });

    it('should handle send failure', async () => {
      const error = new Error('Send failed');
      sgMail.send.mockRejectedValueOnce(error);

      await expect(service.sendEmail(mockEmailData)).rejects.toThrow('Send failed');
    });
  });

  describe('sendBulkEmails', () => {
    const mockRecipients = [
      { email: 'user1@example.com', name: 'User 1' },
      { email: 'user2@example.com', name: 'User 2' },
      { email: 'user3@example.com', name: 'User 3' }
    ];

    it('should process batches correctly', async () => {
      sgMail.sendMultiple.mockResolvedValueOnce([{ statusCode: 202 }]);

      await service.sendBulkEmails(mockRecipients, mockConfig);

      expect(sgMail.sendMultiple).toHaveBeenCalledTimes(2);
    });

    it('should handle batch processing errors', async () => {
      const error = new Error('Batch processing failed');
      sgMail.sendMultiple.mockRejectedValueOnce(error);

      await service.sendBulkEmails(mockRecipients, mockConfig);

      // Should continue processing despite errors
      expect(sgMail.sendMultiple).toHaveBeenCalledTimes(2);
    });
  });
}); 