const logger = require('./logger');

class MetricsService {
  constructor() {
    this.metrics = {
      totalEmails: 0,
      successfulEmails: 0,
      failedEmails: 0,
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      averageBatchProcessingTime: 0,
      totalProcessingTime: 0,
      errors: []
    };
  }

  startBatch() {
    this.metrics.totalBatches++;
    this.batchStartTime = Date.now();
  }

  endBatch(success, error = null) {
    const batchProcessingTime = Date.now() - this.batchStartTime;
    this.metrics.totalProcessingTime += batchProcessingTime;
    
    if (success) {
      this.metrics.successfulBatches++;
    } else {
      this.metrics.failedBatches++;
      if (error) {
        this.metrics.errors.push({
          type: 'batch',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update average batch processing time
    this.metrics.averageBatchProcessingTime = 
      this.metrics.totalProcessingTime / this.metrics.totalBatches;
  }

  recordEmail(success, error = null) {
    this.metrics.totalEmails++;
    
    if (success) {
      this.metrics.successfulEmails++;
    } else {
      this.metrics.failedEmails++;
      if (error) {
        this.metrics.errors.push({
          type: 'email',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalEmails > 0 
        ? (this.metrics.successfulEmails / this.metrics.totalEmails) * 100 
        : 0,
      batchSuccessRate: this.metrics.totalBatches > 0 
        ? (this.metrics.successfulBatches / this.metrics.totalBatches) * 100 
        : 0
    };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    logger.info('Email sending metrics:', {
      totalEmails: metrics.totalEmails,
      successfulEmails: metrics.successfulEmails,
      failedEmails: metrics.failedEmails,
      successRate: `${metrics.successRate.toFixed(2)}%`,
      totalBatches: metrics.totalBatches,
      successfulBatches: metrics.successfulBatches,
      failedBatches: metrics.failedBatches,
      batchSuccessRate: `${metrics.batchSuccessRate.toFixed(2)}%`,
      averageBatchProcessingTime: `${metrics.averageBatchProcessingTime.toFixed(2)}ms`
    });

    if (metrics.errors.length > 0) {
      logger.error('Errors encountered:', metrics.errors);
    }
  }

  reset() {
    this.metrics = {
      totalEmails: 0,
      successfulEmails: 0,
      failedEmails: 0,
      totalBatches: 0,
      successfulBatches: 0,
      failedBatches: 0,
      averageBatchProcessingTime: 0,
      totalProcessingTime: 0,
      errors: []
    };
  }
}

module.exports = new MetricsService(); 