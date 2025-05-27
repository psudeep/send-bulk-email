const logger = require('./logger');

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxAttempts - Maximum number of retry attempts
 * @param {number} options.initialDelay - Initial delay between retries in milliseconds
 * @param {number} options.maxDelay - Maximum delay between retries in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if retry should be attempted
 * @returns {Promise<any>} - Result of the function
 */
async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;

  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      delay = Math.min(delay * 2, maxDelay);
      attempt++;
    }
  }
}

module.exports = retry; 