const jwt = require("jsonwebtoken");
const winston = require("winston");
const path = require("path"); // Impor modul path untuk path yang lebih andal

// Konfigurasi Winston untuk menyimpan log ke file
const logger = winston.createLogger({
  // Gunakan level 'debug' untuk menangkap semua level log (debug, info, warn, error)
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // Menambahkan transport untuk file log
    new winston.transports.File({
      // Menggunakan path.join untuk memastikan path file benar di semua OS
      filename: path.join(__dirname, "../logs/login.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

const authenticateToken = (req, res, next) => {
  // 💡 Praktik Terbaik: Gunakan logger.debug untuk pesan debugging
  logger.debug("=== AUTH MIDDLEWARE START ===");

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  logger.debug(`Authorization header: ${authHeader}`);
  logger.debug(
    `Extracted token: ${token ? token.substring(0, 20) + "..." : "null"}`
  );

  if (token == null) {
    logger.error("❌ No token provided");
    return res.status(401).json({
      error: "Access token required",
      debug: "No authorization header or token found",
    });
  }

  if (!process.env.JWT_SECRET) {
    logger.error("❌ JWT_SECRET not found in environment variables");
    return res.status(500).json({
      error: "Server configuration error",
      debug: "JWT_SECRET not configured",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(`❌ Token verification error: ${err.message}`);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Token expired",
          debug: "JWT token has expired, please login again",
        });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(403).json({
          error: "Invalid token",
          debug: "JWT token is malformed or invalid",
        });
      } else if (err.name === "NotBeforeError") {
        return res.status(403).json({
          error: "Token not active",
          debug: "JWT token is not active yet",
        });
      } else {
        return res.status(403).json({
          error: "Token verification failed",
          debug: err.message,
        });
      }
    }

    logger.info("✅ Token verified successfully");
    logger.debug(`User from token: ${JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
    })}`);

    if (!user.id || !user.username || !user.email) {
      logger.error(`❌ Token missing required user fields: ${JSON.stringify(user)}`);
      return res.status(401).json({
        error: "Invalid authentication data",
        debug: "Token is missing required user fields (id, username, email)",
      });
    }

    req.user = user;
    next();
  });
};

const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    logger.debug("=== ROLE AUTHORIZATION START ===");

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    logger.debug(`Required roles: ${roles}`);
    logger.debug(`User role: ${req.user?.role}`);

    if (!req.user) {
      logger.error("❌ No user in request");
      return res.status(401).json({
        error: "User not authenticated",
        debug: "No user found in request object",
      });
    }

    if (!req.user.role) {
      logger.error("❌ User has no role");
      return res.status(403).json({
        error: "User role not defined",
        debug: "User object doesn't contain role information",
      });
    }

    if (roles.includes(req.user.role)) {
      logger.info("✅ Role authorization passed");
      next();
    } else {
      logger.error("❌ Role authorization failed");
      return res.status(403).json({
        error: "Insufficient permissions",
        debug: `Required roles: ${roles.join(", ")}, User role: ${
          req.user.role
        }`,
      });
    }
  };
};

module.exports = { authenticateToken, authorizeRole };