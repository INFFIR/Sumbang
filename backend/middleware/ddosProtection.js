// middleware/ddosProtection.js
const axios = require('axios');
const rateLimit = require('express-rate-limit');

class DDoSProtection {
  constructor() {
    this.requestTracker = new Map();
    this.apiUrl = process.env.DDOS_API_URL || 'http://localhost:5001';
    this.isApiHealthy = false;
    
    // Test API connection saat startup
    this.testApiConnection();
    
    // Setup cleanup interval
    this.setupCleanup();
  }

  // 🛡️ Rate limiting middleware
  getRateLimiter() {
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 menit
      max: 100, // maksimal 100 request per menit per IP
      message: {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // 🔍 Calculate network metrics dari request pattern
  calculateNetworkMetrics(req) {
    const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const timeWindow = 10000; // 10 detik
    
    // Initialize tracker untuk IP ini jika belum ada
    if (!this.requestTracker.has(clientIP)) {
      this.requestTracker.set(clientIP, []);
    }
    
    const ipRequests = this.requestTracker.get(clientIP);
    
    // Tambah request baru
    ipRequests.push({
      timestamp: now,
      userAgent: req.get('User-Agent') || 'unknown',
      url: req.url,
      method: req.method,
      bodySize: JSON.stringify(req.body || {}).length
    });
    
    // Hapus request lama (di luar time window)
    const recentRequests = ipRequests.filter(r => now - r.timestamp <= timeWindow);
    this.requestTracker.set(clientIP, recentRequests);
    
    // Calculate metrics
    const requestCount = recentRequests.length;
    const packetRate = (requestCount / (timeWindow / 1000)); // requests per second
    
    // Average connection duration (estimasi berdasarkan interval request)
    let avgDuration = 5.0; // default untuk koneksi normal
    if (requestCount > 1) {
      const intervals = [];
      for (let i = 1; i < recentRequests.length; i++) {
        intervals.push(recentRequests[i].timestamp - recentRequests[i-1].timestamp);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      avgDuration = Math.max(0.01, avgInterval / 1000); // convert to seconds
    }
    
    // Calculate other metrics
    const avgBodySize = recentRequests.reduce((sum, r) => sum + (r.bodySize || 0), 0) / requestCount || 100;
    const uniqueUserAgents = new Set(recentRequests.map(r => r.userAgent)).size;
    const protocolVariety = Math.min(1.0, uniqueUserAgents / Math.max(1, requestCount));
    
    // Estimate SYN ratio berdasarkan pola request
    const methodVariety = new Set(recentRequests.map(r => r.method)).size;
    const urlVariety = new Set(recentRequests.map(r => r.url)).size;
    const synRatio = Math.max(0.0, Math.min(1.0, 1.0 - (methodVariety + urlVariety) / (requestCount * 2)));
    
    return {
      packet_rate: Math.max(1, packetRate),
      connection_duration: avgDuration,
      bytes_per_packet: Math.max(64, avgBodySize),
      unique_source_ips: 1, // single IP untuk request ini
      protocol_variety: protocolVariety,
      syn_packet_ratio: synRatio,
      clientIP: clientIP,
      requestCount: requestCount
    };
  }

  // 🔒 Main DDoS detection middleware
  getMiddleware() {
    return async (req, res, next) => {
      try {
        // Skip health checks dan static files
        if (req.url === '/health' || req.url === '/ddos-status' || req.url.startsWith('/static/')) {
          return next();
        }

        // Skip jika API tidak healthy
        if (!this.isApiHealthy) {
          return next();
        }
        
        // Calculate network metrics berdasarkan request pattern
        const metrics = this.calculateNetworkMetrics(req);
        
        // Log metrics untuk debugging (hanya untuk traffic tinggi)
        if (metrics.requestCount > 5) {
          console.log(`🔍 DDoS Check - IP: ${metrics.clientIP}, Rate: ${metrics.packet_rate.toFixed(2)}, Duration: ${metrics.connection_duration.toFixed(3)}s`);
        }
        
        // Call DDoS detection API
        const response = await axios.post(`${this.apiUrl}/predict`, metrics, {
          timeout: 1000, // 1 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const prediction = response.data.prediction;
        
        if (prediction.attack) {
          const logMessage = `⚠️  DDoS DETECTED - IP: ${metrics.clientIP}, ` +
                            `Confidence: ${(prediction.confidence * 100).toFixed(1)}%, ` +
                            `Risk: ${prediction.risk_level}, ` +
                            `Requests: ${metrics.requestCount}`;
          
          console.log(logMessage);
          
          // Block request dengan detailed response
          return res.status(403).json({
            error: "Access Denied",
            message: "⚠️ Blocked by anti-DDoS system",
            details: {
              risk_level: prediction.risk_level,
              confidence: Math.round(prediction.confidence * 100),
              blocked_at: new Date().toISOString()
            }
          });
        }
        
        // Log normal traffic jika confidence rendah (mungkin suspicious)
        if (prediction.attack_probability > 0.3) {
          console.log(`⚡ Suspicious Traffic - IP: ${metrics.clientIP}, ` +
                     `Attack Prob: ${(prediction.attack_probability * 100).toFixed(1)}%`);
        }
        
        next();
        
      } catch (err) {
        this.handleApiError(err);
        // Lanjutkan request jika API down (fail-safe)
        next();
      }
    };
  }

  // 🛠️ Handle API errors
  handleApiError(err) {
    if (err.code === 'ECONNREFUSED') {
      console.error("❌ DDoS API tidak tersedia - pastikan Flask server berjalan di port 5001");
      this.isApiHealthy = false;
    } else if (err.response?.status === 400) {
      console.error("❌ DDoS API error 400 - kemungkinan format data salah:", err.response.data);
    } else if (err.response?.status === 500) {
      console.error("❌ DDoS API internal error:", err.response.data);
      this.isApiHealthy = false;
    } else {
      console.error("❌ Error contacting DDoS API:", err.message);
    }
  }

  // 📊 Get status untuk endpoint
  getStatus() {
    return {
      total_tracked_ips: this.requestTracker.size,
      api_healthy: this.isApiHealthy,
      api_url: this.apiUrl,
      active_connections: Array.from(this.requestTracker.entries()).map(([ip, requests]) => ({
        ip: ip,
        request_count: requests.length,
        last_request: requests[requests.length - 1]?.timestamp ? 
          new Date(requests[requests.length - 1].timestamp).toISOString() : null
      }))
    };
  }

  // 🧹 Setup cleanup interval
  setupCleanup() {
    setInterval(() => {
      const now = Date.now();
      const cleanupThreshold = 5 * 60 * 1000; // 5 menit
      
      for (const [ip, requests] of this.requestTracker.entries()) {
        const recentRequests = requests.filter(r => now - r.timestamp <= cleanupThreshold);
        if (recentRequests.length === 0) {
          this.requestTracker.delete(ip);
        } else {
          this.requestTracker.set(ip, recentRequests);
        }
      }
      
      if (this.requestTracker.size > 0) {
        console.log(`🧹 Cleanup: Tracking ${this.requestTracker.size} IPs`);
      }
    }, 5 * 60 * 1000);
  }

  // 🔧 Test API connection
  async testApiConnection() {
    try {
      const testMetrics = {
        packet_rate: 45.0,
        connection_duration: 15.2,
        bytes_per_packet: 850.0,
        unique_source_ips: 15,
        protocol_variety: 0.8,
        syn_packet_ratio: 0.2
      };
      
      const response = await axios.post(`${this.apiUrl}/predict`, testMetrics, {
        timeout: 2000
      });
      
      if (response.status === 200) {
        this.isApiHealthy = true;
        console.log('✅ DDoS API connection successful');
        console.log(`🛡️  Anti-DDoS protection is ACTIVE`);
      }
      
    } catch (err) {
      this.isApiHealthy = false;
      console.log('⚠️  DDoS API not available - protection will be bypassed');
      console.log('   Make sure to run: python enhanced_rf_server.py');
    }
  }

  // 🔄 Retry API connection (bisa dipanggil manual)
  async retryConnection() {
    console.log('🔄 Retrying DDoS API connection...');
    await this.testApiConnection();
  }
}

module.exports = DDoSProtection;