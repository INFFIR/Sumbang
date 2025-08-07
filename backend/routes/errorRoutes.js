// routes/errorRoutes.js
const express = require('express');
const router = express.Router();

let errorHandler = null;

// Set error handler instance
function setErrorHandler(handler) {
  errorHandler = handler;
}

// 📊 Get error statistics
router.get('/error-stats', (req, res) => {
  if (!errorHandler) {
    return res.status(503).json({
      error: 'Error handler not initialized'
    });
  }

  try {
    const stats = errorHandler.getErrorStats();
    res.json({
      timestamp: new Date().toISOString(),
      statistics: stats
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to get error statistics',
      message: err.message
    });
  }
});

// 🧹 Clean old error logs
router.post('/error-cleanup', (req, res) => {
  if (!errorHandler) {
    return res.status(503).json({
      error: 'Error handler not initialized'
    });
  }

  try {
    const daysToKeep = req.body.days || 7;
    const remainingCount = errorHandler.clearOldLogs(daysToKeep);
    
    res.json({
      message: 'Error logs cleaned successfully',
      remaining_errors: remainingCount,
      days_kept: daysToKeep,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to clean error logs',
      message: err.message
    });
  }
});

// 🧪 Test error endpoint (untuk development/testing)
router.post('/test-error', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      error: 'Endpoint not available in production'
    });
  }

  const { type = 'generic', message = 'Test error' } = req.body;

  try {
    switch (type) {
      case 'validation':
        const { ValidationError } = require('../middleware/errorHandler');
        throw new ValidationError(message, { field: 'test_field' });
      
      case 'auth':
        const { AuthenticationError } = require('../middleware/errorHandler');
        throw new AuthenticationError(message);
      
      case 'notfound':
        const { NotFoundError } = require('../middleware/errorHandler');
        throw new NotFoundError(message);
      
      case 'async':
        // Simulate async error
        setTimeout(() => {
          throw new Error(message);
        }, 100);
        return res.json({ message: 'Async error will be thrown in 100ms' });
      
      case 'database':
        const dbError = new Error(message);
        dbError.name = 'MongoError';
        throw dbError;
      
      case 'timeout':
        const timeoutError = new Error(message);
        timeoutError.code = 'ETIMEOUT';
        throw timeoutError;
      
      default:
        throw new Error(message);
    }
  } catch (error) {
    next(error);
  }
});

// 📋 Get available error types
router.get('/error-types', (req, res) => {
  const errorTypes = [
    {
      name: 'ValidationError',
      status: 400,
      description: 'Invalid input data'
    },
    {
      name: 'AuthenticationError',
      status: 401,
      description: 'Authentication required'
    },
    {
      name: 'AuthorizationError',
      status: 403,
      description: 'Insufficient permissions'
    },
    {
      name: 'NotFoundError',
      status: 404,
      description: 'Resource not found'
    },
    {
      name: 'ConflictError',
      status: 409,
      description: 'Resource conflict'
    },
    {
      name: 'RateLimitError',
      status: 429,
      description: 'Too many requests'
    },
    {
      name: 'ServiceUnavailableError',
      status: 503,
      description: 'Service temporarily unavailable'
    }
  ];

  res.json({
    available_error_types: errorTypes,
    usage: 'POST /test-error with { "type": "validation", "message": "Custom message" }'
  });
});

module.exports = {
  router,
  setErrorHandler
};