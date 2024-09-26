// src/utils/csvParser.js
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class CSVParser {
  constructor() {
    this.requiredFields = ['name', 'email'];
  }

  async parseFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      
      // Ensure the file exists
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`CSV file not found: ${absolutePath}`);
      }

      const jsonArray = await csv().fromFile(absolutePath);

      // Validate that required fields are present
      this.validateFields(jsonArray);

      return jsonArray;
    } catch (error) {
      logger.error('Error parsing CSV file:', error);
      throw error;
    }
  }

  validateFields(jsonArray) {
    if (jsonArray.length === 0) {
      throw new Error('CSV file is empty');
    }

    const missingFields = this.requiredFields.filter(
      field => !jsonArray[0].hasOwnProperty(field)
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in CSV: ${missingFields.join(', ')}`);
    }
  }

  async getRecipients(dataPath) {
    return this.parseFile(dataPath);
  }
}

module.exports = new CSVParser();