const csvParser = require('./csvParser');

const dataSources = {
  csv: csvParser,
  // Add other data sources here (e.g., database, API)
};

module.exports = function getDataSource(type) {
  return dataSources[type] || csvParser; // Default to CSV if type not found
};