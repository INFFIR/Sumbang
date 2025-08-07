// routes/ddosRoutes.js
const express = require('express');
const router = express.Router();

let ddosProtection = null;

// Set DDoS protection instance (akan dipanggil dari index.js)
function setDDoSProtection(protection) {
  ddosProtection = protection;
}

// 📊 Health check endpoint
router.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Express Backend',
  };

  if (ddosProtection) {
    const ddosStatus = ddosProtection.getStatus();
    healthStatus.ddos_protection = {
      active: ddosStatus.api_healthy,
      tracked_ips: ddosStatus.total_tracked_ips,
      api_url: ddosStatus.api_url
    };
  } else {
    healthStatus.ddos_protection = {
      active: false,
      message: 'DDoS protection not initialized'
    };
  }

  res.json(healthStatus);
});

// 📊 DDoS status endpoint (untuk debugging)
router.get('/ddos-status', (req, res) => {
  if (!ddosProtection) {
    return res.status(503).json({
      error: 'DDoS protection not initialized',
      message: 'Service unavailable'
    });
  }

  const status = ddosProtection.getStatus();
  
  res.json({
    timestamp: new Date().toISOString(),
    ddos_protection: {
      ...status,
      uptime: process.uptime(),
      memory_usage: process.memoryUsage()
    }
  });
});

// 🔄 Retry DDoS API connection
router.post('/ddos-retry', async (req, res) => {
  if (!ddosProtection) {
    return res.status(503).json({
      error: 'DDoS protection not initialized',
      message: 'Service unavailable'
    });
  }

  try {
    await ddosProtection.retryConnection();
    const status = ddosProtection.getStatus();
    
    res.json({
      message: 'Connection retry completed',
      api_healthy: status.api_healthy,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to retry connection',
      message: err.message
    });
  }
});

// 🧹 Clear tracking data (untuk testing/debugging)
router.post('/ddos-clear', (req, res) => {
  if (!ddosProtection) {
    return res.status(503).json({
      error: 'DDoS protection not initialized'
    });
  }

  try {
    // Clear request tracker
    ddosProtection.requestTracker.clear();
    
    res.json({
      message: 'Tracking data cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to clear tracking data',
      message: err.message
    });
  }
});

module.exports = {
  router,
  setDDoSProtection
};