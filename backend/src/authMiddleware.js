const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  console.log("=== AUTH MIDDLEWARE DEBUG ===");
  
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);
  
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Extracted token:", token ? token.substring(0, 20) + "..." : "null");
  
  if (token == null) {
    console.error("❌ No token provided");
    return res.status(401).json({ 
      error: "Access token required",
      debug: "No authorization header or token found"
    });
  }

  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET not found in environment variables");
    return res.status(500).json({ 
      error: "Server configuration error",
      debug: "JWT_SECRET not configured"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token verification error:", err.message);
      
      // More specific error messages
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: "Token expired", 
          debug: "JWT token has expired, please login again"
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ 
          error: "Invalid token", 
          debug: "JWT token is malformed or invalid"
        });
      } else if (err.name === 'NotBeforeError') {
        return res.status(403).json({ 
          error: "Token not active", 
          debug: "JWT token is not active yet"
        });
      } else {
        return res.status(403).json({ 
          error: "Token verification failed", 
          debug: err.message 
        });
      }
    }

    console.log("✅ Token verified successfully");
    console.log("User from token:", {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Validate that user has required fields
    if (!user.id || !user.username || !user.email) {
      console.error("❌ Token missing required user fields:", user);
      return res.status(401).json({ 
        error: "Invalid authentication data",
        debug: "Token is missing required user fields (id, username, email)"
      });
    }

    req.user = user;
    next();
  });
};

const authorizeRole = (requiredRoles) => {
  return (req, res, next) => {
    console.log("=== ROLE AUTHORIZATION DEBUG ===");
    
    // Handle both array and single role
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    console.log("Required roles:", roles);
    console.log("User role:", req.user?.role);
    
    if (!req.user) {
      console.error("❌ No user in request");
      return res.status(401).json({ 
        error: "User not authenticated",
        debug: "No user found in request object"
      });
    }

    if (!req.user.role) {
      console.error("❌ User has no role");
      return res.status(403).json({ 
        error: "User role not defined",
        debug: "User object doesn't contain role information"
      });
    }

    if (roles.includes(req.user.role)) {
      console.log("✅ Role authorization passed");
      next();
    } else {
      console.error("❌ Role authorization failed");
      return res.status(403).json({ 
        error: "Insufficient permissions",
        debug: `Required roles: ${roles.join(', ')}, User role: ${req.user.role}`
      });
    }
  };
};

module.exports = { authenticateToken, authorizeRole };