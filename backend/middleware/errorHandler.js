// middleware/errorHandler.js
const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/error.log');
    this.setupLogDirectory();
  }

  // 📁 Setup log directory
  setupLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // 📝 Log error ke file
  logError(error, req = null) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      message: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status || error.statusCode || 500
    };

    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
      };
    }

    const logEntry = JSON.stringify(errorInfo, null, 2) + '\n' + '='.repeat(80) + '\n';

    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (writeError) {
      console.error('❌ Failed to write error log:', writeError.message);
    }
  }

  // 🎯 Get error type
  getErrorType(error) {
    if (error.name === 'ValidationError') return 'VALIDATION';
    if (error.name === 'CastError') return 'CAST';
    if (error.name === 'MongoError') return 'DATABASE';
    if (error.name === 'JsonWebTokenError') return 'JWT';
    if (error.name === 'MulterError') return 'FILE_UPLOAD';
    if (error.code === 'ECONNREFUSED') return 'CONNECTION';
    if (error.code === 'ENOTFOUND') return 'DNS';
    if (error.code === 'ETIMEOUT') return 'TIMEOUT';
    return 'UNKNOWN';
  }

  // 🛡️ Get safe error message untuk user
  getSafeErrorMessage(error) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'VALIDATION':
        return 'Invalid input data provided';
      case 'CAST':
        return 'Invalid data format';
      case 'DATABASE':
        return 'Database operation failed';
      case 'JWT':
        return 'Authentication failed';
      case 'FILE_UPLOAD':
        return 'File upload failed';
      case 'CONNECTION':
        return 'Service temporarily unavailable';
      case 'DNS':
        return 'External service unavailable';
      case 'TIMEOUT':
        return 'Request timeout - please try again';
      default:
        return 'An unexpected error occurred';
    }
  }

  // 🔍 Check if error should be exposed to client
  shouldExposeError(error) {
    // Expose validation errors, client errors (4xx)
    return error.status >= 400 && error.status < 500;
  }

  // 🚨 Main error handler middleware
  handleError() {
    return (err, req, res, next) => {
      // Set default error status
      const status = err.status || err.statusCode || 500;
      
      // Log error
      this.logError(err, req);
      
      // Console log untuk development
      if (process.env.NODE_ENV !== 'production') {
        console.error('🚨 Error caught by handler:');
        console.error('   Status:', status);
        console.error('   Message:', err.message);
        console.error('   Stack:', err.stack);
        if (req) {
          console.error('   Request:', req.method, req.url);
          console.error('   IP:', req.ip);
        }
      }

      // Prepare response
      const response = {
        error: true,
        status,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      };

      // Add appropriate message
      if (this.shouldExposeError(err)) {
        response.message = err.message;
        if (err.details) {
          response.details = err.details;
        }
      } else {
        response.message = this.getSafeErrorMessage(err);
        if (process.env.NODE_ENV !== 'production') {
          response.debug = {
            originalMessage: err.message,
            stack: err.stack
          };
        }
      }

      // Send response
      res.status(status).json(response);
    };
  }

  // 🔧 Handle async errors
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // 📊 Get error statistics
  getErrorStats() {
    try {
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const errors = logContent.split('='.repeat(80)).filter(entry => entry.trim());
      
      const stats = {
        total_errors: errors.length,
        recent_errors: 0,
        error_types: {},
        status_codes: {}
      };

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      errors.forEach(errorEntry => {
        try {
          const errorData = JSON.parse(errorEntry.trim());
          const errorTime = new Date(errorData.timestamp);
          
          if (errorTime > oneDayAgo) {
            stats.recent_errors++;
          }

          const errorType = this.getErrorType({ 
            name: errorData.name, 
            code: errorData.code 
          });
          stats.error_types[errorType] = (stats.error_types[errorType] || 0) + 1;
          
          const status = errorData.status || 500;
          stats.status_codes[status] = (stats.status_codes[status] || 0) + 1;
        } catch (parseError) {
          // Skip invalid log entries
        }
      });

      return stats;
    } catch (err) {
      return {
        total_errors: 0,
        recent_errors: 0,
        error_types: {},
        status_codes: {},
        error: 'Unable to read error log'
      };
    }
  }

  // 🧹 Clear old logs
  clearOldLogs(daysToKeep = 7) {
    try {
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const errors = logContent.split('='.repeat(80));
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const recentErrors = errors.filter(errorEntry => {
        try {
          const errorData = JSON.parse(errorEntry.trim());
          const errorTime = new Date(errorData.timestamp);
          return errorTime > cutoffDate;
        } catch {
          return false;
        }
      });

      const cleanedContent = recentErrors.join('='.repeat(80) + '\n');
      fs.writeFileSync(this.logFile, cleanedContent);
      
      console.log(`🧹 Cleaned error logs: kept ${recentErrors.length} recent errors`);
      return recentErrors.length;
    } catch (err) {
      console.error('❌ Failed to clean error logs:', err.message);
      return 0;
    }
  }
}

// 🏭 Create custom error classes
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message = 'Service temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.status = 503;
  }
}

module.exports = {
  ErrorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError
};