// middleware/responseHandler.js

class ResponseHandler {
  // 📤 Success response
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      status: statusCode,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  // 📊 Paginated response
  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const response = {
      success: true,
      status: 200,
      message,
      timestamp: new Date().toISOString(),
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
      }
    };

    return res.status(200).json(response);
  }

  // ✅ Created response
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  // ✏️ Updated response
  static updated(res, data = null, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  // 🗑️ Deleted response
  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }

  // ⚠️ Warning response (for non-critical issues)
  static warning(res, message, data = null, statusCode = 200) {
    const response = {
      success: true,
      status: statusCode,
      message,
      warning: true,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  // 🚫 Client error responses
  static badRequest(res, message = 'Bad request', details = null) {
    const response = {
      success: false,
      status: 400,
      error: 'Bad Request',
      message,
      timestamp: new Date().toISOString()
    };

    if (details) {
      response.details = details;
    }

    return res.status(400).json(response);
  }

  static unauthorized(res, message = 'Authentication required') {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString()
    });
  }

  static forbidden(res, message = 'Access denied') {
    return res.status(403).json({
      success: false,
      status: 403,
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString()
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      status: 404,
      error: 'Not Found',
      message,
      timestamp: new Date().toISOString()
    });
  }

  static conflict(res, message = 'Resource already exists') {
    return res.status(409).json({
      success: false,
      status: 409,
      error: 'Conflict',
      message,
      timestamp: new Date().toISOString()
    });
  }

  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      status: 422,
      error: 'Validation Error',
      message: 'Input validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static rateLimited(res, message = 'Too many requests') {
    return res.status(429).json({
      success: false,
      status: 429,
      error: 'Rate Limited',
      message,
      timestamp: new Date().toISOString()
    });
  }

  // 🖥️ Server error responses
  static serverError(res, message = 'Internal server error') {
    return res.status(500).json({
      success: false,
      status: 500,
      error: 'Internal Server Error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  static serviceUnavailable(res, message = 'Service temporarily unavailable') {
    return res.status(503).json({
      success: false,
      status: 503,
      error: 'Service Unavailable',
      message,
      timestamp: new Date().toISOString()
    });
  }

  // 🔧 Custom response
  static custom(res, statusCode, success, message, data = null, error = null) {
    const response = {
      success,
      status: statusCode,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    if (error) {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  }

  // 📱 API Info response
  static apiInfo(res, info = {}) {
    const defaultInfo = {
      name: 'Express API',
      version: '1.0.0',
      description: 'RESTful API with DDoS Protection',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    };

    return this.success(res, { ...defaultInfo, ...info }, 'API information retrieved');
  }
}

// 🎭 Express middleware untuk menambahkan response helpers ke res object
function responseMiddleware(req, res, next) {
  // Add response helper methods to res object
  res.success = (data, message, statusCode) => ResponseHandler.success(res, data, message, statusCode);
  res.created = (data, message) => ResponseHandler.created(res, data, message);
  res.updated = (data, message) => ResponseHandler.updated(res, data, message);
  res.deleted = (message) => ResponseHandler.deleted(res, message);
  res.paginated = (data, pagination, message) => ResponseHandler.paginated(res, data, pagination, message);
  res.warning = (message, data, statusCode) => ResponseHandler.warning(res, message, data, statusCode);
  
  res.badRequest = (message, details) => ResponseHandler.badRequest(res, message, details);
  res.unauthorized = (message) => ResponseHandler.unauthorized(res, message);
  res.forbidden = (message) => ResponseHandler.forbidden(res, message);
  res.notFound = (message) => ResponseHandler.notFound(res, message);
  res.conflict = (message) => ResponseHandler.conflict(res, message);
  res.validationError = (errors) => ResponseHandler.validationError(res, errors);
  res.rateLimited = (message) => ResponseHandler.rateLimited(res, message);
  
  res.serverError = (message) => ResponseHandler.serverError(res, message);
  res.serviceUnavailable = (message) => ResponseHandler.serviceUnavailable(res, message);
  
  res.custom = (statusCode, success, message, data, error) => ResponseHandler.custom(res, statusCode, success, message, data, error);
  res.apiInfo = (info) => ResponseHandler.apiInfo(res, info);

  next();
}

module.exports = {
  ResponseHandler,
  responseMiddleware
};