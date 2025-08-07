// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Import routes
const authRoutes = require("./routes/auth");
const requestDataRoutes = require("./routes/request_data");
const verifikasiRoutes = require("./routes/verifikasi");
const manageUsersRoutes = require("./routes/manageUsers");
const manageContentRoutes = require("./routes/manageContent");
const detailRoute = require("./routes/detail");
const laporanRoutes = require("./routes/riwayatLaporan");
const emailRoutes = require("./routes/emailRoutes");

// Import middleware
const DDoSProtection = require("./middleware/ddosProtection");
const { ErrorHandler } = require("./middleware/errorHandler");
const { responseMiddleware } = require("./middleware/responseHandler");

// Import monitoring routes
const { router: ddosRoutes, setDDoSProtection } = require("./routes/ddosRoutes");
const { router: errorRoutes, setErrorHandler } = require("./routes/errorRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT;

// Initialize middleware
console.log('🛡️  Initializing protection and handlers...');
const ddosProtection = new DDoSProtection();
const errorHandler = new ErrorHandler();

setDDoSProtection(ddosProtection);
setErrorHandler(errorHandler);

// Basic middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(responseMiddleware); // Add response helpers

// Apply DDoS protection middleware
app.use(ddosProtection.getRateLimiter()); // Rate limiting
app.use(ddosProtection.getMiddleware());  // DDoS detection


// API Routes
app.use("/api", authRoutes);
app.use("/api", requestDataRoutes);
app.use("/api", verifikasiRoutes);
app.use("/api", manageUsersRoutes);
app.use("/api", manageContentRoutes);
app.use('/api', detailRoute);
app.use("/api", laporanRoutes);
app.use("/api", emailRoutes);

// 404 handler
app.use((req, res) => {
  res.notFound('The requested endpoint does not exist');
});

// Error handling middleware (harus di akhir)
app.use(errorHandler.handleError());

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('📊 Available monitoring endpoints:');
  console.log('   GET  /health       - Health check');
  console.log('   GET  /ddos-status  - DDoS protection status');
  console.log('   GET  /error-stats  - Error statistics');
  console.log('   POST /ddos-retry   - Retry DDoS API connection');
});