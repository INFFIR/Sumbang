const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// const authorizeRole = (role) => {
//   return (req, res, next) => {
//     if (req.user.role !== 'Admin') {
//       return res.status(403).json({ message: "Access denied: Unauthorized role" });
//     }
//     next();
//   };
// };

const authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user?.role || req.user.role !== requiredRole) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};


// module.exports = authenticateToken;
module.exports = {authenticateToken,  authorizeRole};
